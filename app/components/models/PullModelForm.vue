<script setup lang="ts">
const modelName = ref('')
const modelsStore = useModelsStore()
const toast = useToast()
const { start, isStreaming } = useNdjsonStream()
const showCatalogue = ref(false)

function selectFromCatalogue(name: string) {
  modelName.value = name
}

async function pullModel() {
  const name = modelName.value.trim()
  if (!name) return
  if (modelsStore.isOperationInProgress(name)) {
    toast.error(`Operation already in progress for ${name}`)
    return
  }

  modelsStore.setOperation(name, { type: 'pull', status: 'starting', progress: 0, total: 0 })

  await start('/api/models/pull', { name }, {
    onChunk(data) {
      modelsStore.setOperation(name, {
        type: 'pull',
        status: data.status || 'downloading',
        progress: data.completed || 0,
        total: data.total || 0,
      })
    },
    onDone() {
      modelsStore.clearOperation(name)
      modelsStore.fetchModels()
      toast.success(`Model ${name} pulled successfully`)
      modelName.value = ''
    },
    onError(err) {
      modelsStore.clearOperation(name)
      toast.error(`Pull failed: ${err.message}`)
    },
  })
}
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-xl p-4">
    <h3 class="text-sm font-medium text-text-secondary mb-3">Pull a Model</h3>
    <form class="flex gap-2" @submit.prevent="pullModel">
      <input
        v-model="modelName"
        type="text"
        placeholder="e.g. llama3:8b"
        class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        :disabled="!modelName.trim() || isStreaming"
      >
        Pull
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm border border-border rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors"
        @click="showCatalogue = true"
      >
        Browse
      </button>
    </form>

    <ModelsRegistryCatalogue
      v-if="showCatalogue"
      @select="selectFromCatalogue"
      @close="showCatalogue = false"
    />
  </div>
</template>
