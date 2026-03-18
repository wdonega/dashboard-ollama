<script setup lang="ts">
const props = defineProps<{
  modelName: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const detail = ref<any>(null)
const loading = ref(false)
const modelsStore = useModelsStore()

watch(() => props.modelName, async (name) => {
  if (!name) { detail.value = null; return }
  loading.value = true
  try {
    detail.value = await modelsStore.getModelDetail(name)
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelName"
      class="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="bg-bg-secondary border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">{{ modelName }}</h3>
          <button class="text-text-secondary hover:text-text-primary" @click="emit('close')">&times;</button>
        </div>
        <div v-if="loading" class="text-text-secondary">Loading...</div>
        <div v-else-if="detail" class="space-y-4">
          <div v-if="detail.details">
            <h4 class="text-sm font-medium text-text-secondary mb-1">Details</h4>
            <div class="text-sm bg-bg-tertiary rounded-lg p-3 space-y-1">
              <div v-for="(val, key) in detail.details" :key="key">
                <span class="text-text-secondary">{{ key }}:</span> {{ val }}
              </div>
            </div>
          </div>
          <div v-if="detail.system">
            <h4 class="text-sm font-medium text-text-secondary mb-1">System Prompt</h4>
            <pre class="text-sm bg-bg-tertiary rounded-lg p-3 whitespace-pre-wrap">{{ detail.system }}</pre>
          </div>
          <div v-if="detail.template">
            <h4 class="text-sm font-medium text-text-secondary mb-1">Template</h4>
            <pre class="text-sm bg-bg-tertiary rounded-lg p-3 whitespace-pre-wrap overflow-x-auto">{{ detail.template }}</pre>
          </div>
          <div v-if="detail.parameters">
            <h4 class="text-sm font-medium text-text-secondary mb-1">Parameters</h4>
            <pre class="text-sm bg-bg-tertiary rounded-lg p-3 whitespace-pre-wrap">{{ detail.parameters }}</pre>
          </div>
          <div v-if="detail.license">
            <h4 class="text-sm font-medium text-text-secondary mb-1">License</h4>
            <pre class="text-sm bg-bg-tertiary rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">{{ detail.license }}</pre>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
