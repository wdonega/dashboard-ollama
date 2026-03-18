<script setup lang="ts">
defineProps<{
  models: any[]
  operationsInProgress: Map<string, any>
  viewMode: 'list' | 'grid'
}>()

const emit = defineEmits<{
  delete: [name: string]
  detail: [name: string]
}>()
</script>

<template>
  <div>
    <div class="space-y-2 mb-4" v-if="operationsInProgress.size > 0">
      <ModelsOperationProgress
        v-for="[name, op] in operationsInProgress"
        :key="`op-${name}`"
        :name="name"
        :operation="op"
      />
    </div>
    <div v-if="models.length === 0" class="text-text-secondary text-sm py-8 text-center">
      No models installed
    </div>
    <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'">
      <ModelsModelCard
        v-for="model in models"
        :key="model.name"
        :model="model"
        :has-operation="operationsInProgress.has(model.name)"
        @delete="emit('delete', $event)"
        @detail="emit('detail', $event)"
      />
    </div>
  </div>
</template>
