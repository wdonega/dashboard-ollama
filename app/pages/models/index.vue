<script setup lang="ts">
const modelsStore = useModelsStore()
const toast = useToast()
const search = ref('')
const selectedModel = ref<string | null>(null)
const viewMode = ref<'list' | 'grid'>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('models-view-mode') as any) || 'list'
)

function setViewMode(mode: 'list' | 'grid') {
  viewMode.value = mode
  localStorage.setItem('models-view-mode', mode)
}

onMounted(() => {
  modelsStore.fetchModels()
})

const filteredModels = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return modelsStore.models
  return modelsStore.models.filter(m =>
    m.name.toLowerCase().includes(q) || m.details.family.toLowerCase().includes(q)
  )
})

async function handleDelete(name: string) {
  try {
    await modelsStore.deleteModel(name)
    toast.success(`Model ${name} deleted`)
  } catch (err: any) {
    toast.error(`Delete failed: ${err.message}`)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold" style="font-family: var(--font-heading)">Models</h2>
      <div class="flex items-center gap-3">
        <button
          class="px-3 py-1.5 text-xs rounded-lg border border-border"
          :class="viewMode === 'list' ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary'"
          @click="setViewMode('list')"
        >
          List
        </button>
        <button
          class="px-3 py-1.5 text-xs rounded-lg border border-border"
          :class="viewMode === 'grid' ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary'"
          @click="setViewMode('grid')"
        >
          Grid
        </button>
        <NuxtLink
          to="/models/create"
          class="px-4 py-1.5 text-sm bg-accent text-white font-medium rounded-xl hover:bg-accent-hover cursor-pointer transition-colors duration-200"
        >
          + Create Model
        </NuxtLink>
      </div>
    </div>

    <div class="mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search models..."
        class="w-full max-w-sm bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-all duration-200"
      />
    </div>

    <div class="space-y-4">
      <ModelsPullModelForm />

      <ModelsModelList
        :models="filteredModels"
        :operations-in-progress="modelsStore.operationsInProgress"
        :view-mode="viewMode"
        @delete="handleDelete"
        @detail="selectedModel = $event"
      />
    </div>

    <ModelsModelDetailModal
      :model-name="selectedModel"
      @close="selectedModel = null"
    />
  </div>
</template>
