<script setup lang="ts">
defineProps<{
  name: string
  operation: {
    type: string
    status: string
    progress: number
    total: number
  }
}>()
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-xl p-4">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium">{{ operation.type === 'pull' ? 'Pulling' : 'Creating' }}: {{ name }}</span>
      <span class="text-xs text-text-secondary">{{ operation.status }}</span>
    </div>
    <div class="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
      <div
        class="h-full bg-accent rounded-full transition-all duration-300"
        :style="{ width: operation.total > 0 ? `${(operation.progress / operation.total) * 100}%` : '0%' }"
      />
    </div>
    <span v-if="operation.total > 0" class="text-xs text-text-secondary mt-1 block">
      {{ Math.round((operation.progress / operation.total) * 100) }}%
    </span>
  </div>
</template>
