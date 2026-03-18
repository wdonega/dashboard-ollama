<script setup lang="ts">
const ollamaStore = useOllamaStore()

onMounted(() => {
  ollamaStore.startPolling()
})

onUnmounted(() => {
  ollamaStore.stopPolling()
})
</script>

<template>
  <div class="min-h-screen">
    <LayoutAppSidebar :online="ollamaStore.online" />
    <main class="md:ml-64 p-6 pt-16 md:pt-6">
      <div
        v-if="!ollamaStore.online"
        class="mb-4 flex items-center gap-3 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm"
      >
        <span class="w-2 h-2 rounded-full bg-danger shrink-0" />
        Ollama is unreachable. Retrying every 10s...
      </div>
      <slot />
    </main>
  </div>
</template>
