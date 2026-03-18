<script setup lang="ts">
const props = defineProps<{
  model: {
    name: string
    size: number
    modified_at: string
    details: {
      family: string
      parameter_size: string
      quantization_level: string
    }
  }
  hasOperation: boolean
}>()

const emit = defineEmits<{
  delete: [name: string]
  detail: [name: string]
}>()

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

const confirmDelete = ref(false)
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-xl p-4 flex justify-between items-center">
    <div class="flex-1 min-w-0">
      <button
        class="font-medium text-text-primary hover:text-accent transition-colors text-left"
        @click="emit('detail', model.name)"
      >
        {{ model.name }}
      </button>
      <div class="flex gap-3 mt-1 text-xs text-text-secondary">
        <span>{{ formatSize(model.size) }}</span>
        <span>{{ model.details?.family }}</span>
        <span>{{ model.details?.parameter_size }}</span>
        <span>{{ model.details?.quantization_level }}</span>
        <span>{{ formatDate(model.modified_at) }}</span>
      </div>
    </div>
    <div class="ml-4 flex-shrink-0">
      <button
        v-if="!confirmDelete"
        class="px-3 py-1.5 text-xs rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
        :disabled="hasOperation"
        @click="confirmDelete = true"
      >
        Delete
      </button>
      <div v-else class="flex gap-2">
        <button
          class="px-3 py-1.5 text-xs rounded-lg bg-danger text-white hover:bg-danger/80"
          @click="emit('delete', model.name); confirmDelete = false"
        >
          Confirm
        </button>
        <button
          class="px-3 py-1.5 text-xs rounded-lg border border-border text-text-secondary hover:bg-bg-tertiary"
          @click="confirmDelete = false"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
