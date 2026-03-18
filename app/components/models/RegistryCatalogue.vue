<script setup lang="ts">
const emit = defineEmits<{
  select: [name: string]
  close: []
}>()

const query = ref('')
const results = ref<Array<{ name: string; description: string }>>([])
const loading = ref(false)
const error = ref('')

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    const data = await $fetch<{ models: any[] }>('/api/registry/search', {
      params: { q: query.value, page: 1 },
    })
    results.value = data.models || []
  } catch (err: any) {
    error.value = err.data?.message || 'Registry unavailable. Use direct pull instead.'
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="bg-bg-secondary border border-border rounded-xl max-w-lg w-full max-h-[70vh] flex flex-col p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Model Catalogue</h3>
          <button class="text-text-secondary hover:text-text-primary" @click="emit('close')">&times;</button>
        </div>

        <form class="flex gap-2 mb-4" @submit.prevent="search">
          <input
            v-model="query"
            type="text"
            placeholder="Search models..."
            class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:bg-accent-hover disabled:opacity-50"
            :disabled="loading"
          >
            Search
          </button>
        </form>

        <div v-if="error" class="text-sm text-danger mb-3">{{ error }}</div>

        <div class="flex-1 overflow-y-auto space-y-2">
          <div v-if="loading" class="text-sm text-text-secondary text-center py-4">Searching...</div>
          <button
            v-for="model in results"
            :key="model.name"
            class="w-full text-left p-3 bg-bg-tertiary rounded-lg hover:border-accent border border-border transition-colors"
            @click="emit('select', model.name); emit('close')"
          >
            <div class="font-medium text-sm">{{ model.name }}</div>
            <div v-if="model.description" class="text-xs text-text-secondary mt-1">{{ model.description }}</div>
          </button>
          <div v-if="!loading && results.length === 0 && !error" class="text-sm text-text-secondary text-center py-4">
            Search the Ollama model registry
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
