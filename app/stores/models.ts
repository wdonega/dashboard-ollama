interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    parameter_size: string
    quantization_level: string
  }
}

interface Operation {
  type: 'pull' | 'create'
  status: string
  progress: number
  total: number
}

export const useModelsStore = defineStore('models', () => {
  const models = ref<OllamaModel[]>([])
  const loading = ref(false)
  const operationsInProgress = ref<Map<string, Operation>>(new Map())

  const totalDiskSize = computed(() =>
    models.value.reduce((sum, m) => sum + m.size, 0)
  )

  async function fetchModels() {
    loading.value = true
    try {
      const data = await $fetch<{ models: OllamaModel[] }>('/api/models')
      models.value = data.models || []
    } catch {
      // Keep existing list on error
    } finally {
      loading.value = false
    }
  }

  async function deleteModel(name: string) {
    await $fetch(`/api/models/${encodeURIComponent(name)}`, { method: 'DELETE' })
    models.value = models.value.filter(m => m.name !== name)
  }

  async function getModelDetail(name: string) {
    return await $fetch(`/api/models/${encodeURIComponent(name)}`)
  }

  function isOperationInProgress(name: string): boolean {
    return operationsInProgress.value.has(name)
  }

  function setOperation(name: string, op: Operation) {
    operationsInProgress.value = new Map(operationsInProgress.value.set(name, op))
  }

  function clearOperation(name: string) {
    const newMap = new Map(operationsInProgress.value)
    newMap.delete(name)
    operationsInProgress.value = newMap
  }

  return {
    models, loading, operationsInProgress, totalDiskSize,
    fetchModels, deleteModel, getModelDetail,
    isOperationInProgress, setOperation, clearOperation,
  }
})
