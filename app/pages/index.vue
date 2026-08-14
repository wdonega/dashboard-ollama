<script setup lang="ts">
const ollamaStore = useOllamaStore()
const modelsStore = useModelsStore()

const refreshing = ref(false)

async function refreshAll() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await Promise.all([
      ollamaStore.fetchStatus(),
      modelsStore.fetchModels(),
    ])
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  modelsStore.fetchModels()
})
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold" style="font-family: var(--font-heading)">Dashboard</h2>
        <p class="text-text-secondary mt-1">System overview</p>
      </div>
      <button
          type="button"
          class="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-border bg-bg-secondary hover:border-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="refreshing"
          @click="refreshAll"
      >
        <svg
            class="w-4 h-4 transition-transform duration-500"
            :class="{ 'animate-spin': refreshing }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        >
          <path d="M3 12a9 9 0 0 1 15.5-6.3M21 12a9 9 0 0 1-15.5 6.3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M18 3v4.5h-4.5M6 21v-4.5h4.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Refresh
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <DashboardStatusCard
          :online="ollamaStore.online"
          :version="ollamaStore.version"
      />
      <DashboardModelsSummaryCard
          :count="modelsStore.models.length"
          :total-size="modelsStore.totalDiskSize"
      />
      <DashboardSystemCard
          class="md:col-span-2"
          :cpu="ollamaStore.system.cpu"
          :ram="ollamaStore.system.ram"
          :gpu="ollamaStore.system.gpu"
      />
      <DashboardRunningModelsCard
          class="md:col-span-4"
          :models="ollamaStore.modelsRunning"
      />
    </div>
  </div>
</template>