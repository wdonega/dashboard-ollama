interface SystemInfo {
  cpu: { used_percent: number }
  ram: { used_mb: number; total_mb: number }
  gpu: { name: string; vram_used_mb?: number; vram_total_mb?: number; load_percent?: number; temp_celsius?: number } | null
}

export const useOllamaStore = defineStore('ollama', () => {
  const online = ref(false)
  const version = ref<string | null>(null)
  const modelsRunning = ref<any[]>([])
  const system = ref<SystemInfo>({ cpu: { used_percent: 0 }, ram: { used_mb: 0, total_mb: 0 }, gpu: null })

  async function fetchStatus() {
    try {
      const data = await $fetch('/api/status')
      online.value = data.online
      version.value = data.version
      modelsRunning.value = data.models_running
      system.value = data.system
    } catch {
      online.value = false
    }
  }

  let intervalId: ReturnType<typeof setInterval> | null = null
  let stopWatcher: (() => void) | null = null

  function startPolling() {
    stopPolling()
    fetchStatus()

    stopWatcher = watch(online, (isOnline) => {
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(fetchStatus, isOnline ? 5000 : 10000)
    }, { immediate: true })
  }

  function stopPolling() {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    if (stopWatcher) { stopWatcher(); stopWatcher = null }
  }

  return { online, version, modelsRunning, system, fetchStatus, startPolling, stopPolling }
})