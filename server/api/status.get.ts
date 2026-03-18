export default defineEventHandler(async (event) => {
  const host = getOllamaHost(event)

  try {
    await fetch(host, { signal: AbortSignal.timeout(5000) })

    const versionRes = await ollamaFetch(event, '/api/version')
    const versionData = await versionRes.json() as { version: string }

    const psRes = await ollamaFetch(event, '/api/ps')
    const psData = await psRes.json() as { models?: any[] }

    const [ram, gpu] = await Promise.all([getRamInfo(), getGpuInfo()])

    return {
      online: true,
      version: versionData.version,
      models_running: psData.models || [],
      system: { ram, gpu },
    }
  } catch {
    return {
      online: false,
      version: null,
      models_running: [],
      system: { ram: await getRamInfo(), gpu: await getGpuInfo() },
    }
  }
})
