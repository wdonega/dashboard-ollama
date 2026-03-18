<script setup lang="ts">
const store = useApiTesterStore()

const emit = defineEmits<{
  select: [entry: any]
}>()
</script>

<template>
  <div class="border-t border-border pt-3">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium text-text-secondary">History</h3>
      <button
        v-if="store.history.length > 0"
        class="text-xs text-text-secondary hover:text-text-primary"
        @click="store.clearHistory()"
      >
        Clear
      </button>
    </div>
    <div class="space-y-1 max-h-40 overflow-y-auto">
      <button
        v-for="(entry, i) in store.history"
        :key="i"
        class="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-bg-tertiary transition-colors flex justify-between"
        @click="emit('select', entry)"
      >
        <span class="font-mono">{{ entry.request.method }} {{ entry.request.endpoint }}</span>
        <span :class="entry.response.status < 400 ? 'text-accent' : 'text-danger'">
          {{ entry.response.status }}
        </span>
      </button>
      <div v-if="store.history.length === 0" class="text-xs text-text-secondary py-2 text-center">
        No requests yet
      </div>
    </div>
  </div>
</template>
