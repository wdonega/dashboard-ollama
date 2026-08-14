export default defineEventHandler(async (event) => {
  const host = getOllamaHost(event)

  try {
    await fetch(host, { signal: AbortSignal.timeout(5000) })

    const versionRes = await ollamaFetch(event, '/api/version')
    const versionData = await versionRes.json() as { version: string }

    const psRes = await ollamaFetch(event, '/api/ps')
    const psData = await psRes.json() as { models?: any[] }

    const [cpu, ram, gpu] = await Promise.all([getCpuInfo(event), getRamInfo(event), getGpuInfo(event)])

    return {
      online: true,
      version: versionData.version,
      models_running: psData.models || [],
      system: { cpu, ram, gpu },
    }
  } catch {
    return {
      online: false,
      version: null,
      models_running: [],
      system: { cpu: await getCpuInfo(event), ram: await getRamInfo(event), gpu: await getGpuInfo(event) },
    }
  }
})