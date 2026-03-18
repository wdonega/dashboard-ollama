<script setup lang="ts">
const ollamaStore = useOllamaStore()
const modelsStore = useModelsStore()

onMounted(() => {
  modelsStore.fetchModels()
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold" style="font-family: var(--font-heading)">Dashboard</h2>
      <p class="text-text-secondary mt-1">System overview</p>
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
