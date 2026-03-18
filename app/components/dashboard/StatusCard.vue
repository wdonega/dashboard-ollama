<script setup lang="ts">
defineProps<{
  online: boolean
  version: string | null
}>()
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-300 hover:border-accent/30">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h3 class="text-sm font-medium text-text-secondary">Ollama Status</h3>
    </div>
    <div class="flex items-center gap-3">
      <span
        class="w-3 h-3 rounded-full shrink-0 transition-shadow duration-300"
        :class="online ? 'bg-success shadow-[0_0_8px_#22c55e] animate-pulse' : 'bg-danger'"
      />
      <span class="text-2xl font-bold" style="font-family: var(--font-heading)" :class="online ? 'text-success' : 'text-danger'">
        {{ online ? 'Online' : 'Offline' }}
      </span>
    </div>
    <div v-if="version" class="mt-4">
      <span class="bg-bg-tertiary rounded-full px-3 py-1 text-xs text-text-secondary">
        v{{ version }}
      </span>
    </div>
  </div>
</template>
