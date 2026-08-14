interface CpuInfo {
  used_percent: number
}

interface RamInfo {
  used_mb: number
  total_mb: number
}

interface GpuInfo {
  name: string
  // Discrete GPUs monitored via nvidia_gpu_exporter (if deployed): VRAM used/total
  vram_used_mb?: number
  vram_total_mb?: number
  // Integrated GPUs (Tegra/Jetson) via a textfile-collector metric: load %
  load_percent?: number
  // Fallback signal when only thermal data is available (no load metric yet)
  temp_celsius?: number
}

/**
 * Runs a Prometheus instant query and returns the first sample's value,
 * or null if the query errors, times out, or has no result — which is the
 * expected case whenever Prometheus/the target isn't configured yet.
 */
async function promQuery(promUrl: string, query: string): Promise<number | null> {
  try {
    const url = `${promUrl}/api/v1/query?query=${encodeURIComponent(query)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null

    const data = await res.json() as {
      status: string
      data?: { result?: Array<{ value: [number, string] }> }
    }
    const sample = data.data?.result?.[0]?.value?.[1]
    if (sample === undefined) return null

    const parsed = parseFloat(sample)
    return Number.isNaN(parsed) ? null : parsed
  } catch {
    return null
  }
}

function getPrometheusConfig(event: any): { url: string; instance: string } | null {
  const config = useRuntimeConfig(event)
  const url = config.prometheusUrl as string
  const instance = config.prometheusInstance as string
  if (!url || !instance) return null
  return { url, instance }
}

export async function getCpuInfo(event: any): Promise<CpuInfo> {
  const prom = getPrometheusConfig(event)
  if (!prom) return { used_percent: 0 }

  // 100 minus the average idle-time rate across all cores over the last 5m
  const idleRatio = await promQuery(
      prom.url,
      `avg(rate(node_cpu_seconds_total{mode="idle",instance="${prom.instance}"}[5m]))`,
  )
  if (idleRatio === null) return { used_percent: 0 }

  return { used_percent: Math.round((1 - idleRatio) * 100) }
}

export async function getRamInfo(event: any): Promise<RamInfo> {
  const prom = getPrometheusConfig(event)
  if (!prom) return { used_mb: 0, total_mb: 0 }

  const [total, available] = await Promise.all([
    promQuery(prom.url, `node_memory_MemTotal_bytes{instance="${prom.instance}"}`),
    promQuery(prom.url, `node_memory_MemAvailable_bytes{instance="${prom.instance}"}`),
  ])

  if (total === null || available === null) return { used_mb: 0, total_mb: 0 }

  return {
    total_mb: Math.round(total / (1024 * 1024)),
    used_mb: Math.round((total - available) / (1024 * 1024)),
  }
}

export async function getGpuInfo(event: any): Promise<GpuInfo | null> {
  const prom = getPrometheusConfig(event)
  if (!prom) return null

  // Discrete GPU via nvidia_gpu_exporter, if that's what's monitoring this host
  const [vramUsed, vramTotal, gpuName] = await Promise.all([
    promQuery(prom.url, `nvidia_smi_memory_used_bytes{instance="${prom.instance}"}`),
    promQuery(prom.url, `nvidia_smi_memory_total_bytes{instance="${prom.instance}"}`),
    promQuery(prom.url, `nvidia_smi_gpu_info{instance="${prom.instance}"}`),
  ])
  if (vramTotal !== null) {
    return {
      name: gpuName !== null ? 'NVIDIA GPU' : 'NVIDIA GPU',
      vram_used_mb: Math.round((vramUsed ?? 0) / (1024 * 1024)),
      vram_total_mb: Math.round(vramTotal / (1024 * 1024)),
    }
  }

  // Tegra iGPU load %, requires the textfile-collector script exposing
  // tegra_gpu_load_percent (node_exporter has no built-in GPU load metric)
  const loadPercent = await promQuery(prom.url, `tegra_gpu_load_percent{instance="${prom.instance}"}`)
  if (loadPercent !== null) {
    return { name: 'Tegra iGPU', load_percent: Math.round(loadPercent) }
  }

  // Last resort: node_exporter's built-in GPU thermal zone exists on Jetson
  // even without the custom load-% script, so at least show something
  // rather than "No GPU detected" when we know a Tegra GPU is there.
  const temp = await promQuery(prom.url, `node_thermal_zone_temp{instance="${prom.instance}",type="gpu-thermal"}`)
  if (temp !== null) {
    return { name: 'Tegra iGPU', temp_celsius: Math.round(temp * 10) / 10 }
  }

  return null
}