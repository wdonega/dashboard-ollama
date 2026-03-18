<script setup lang="ts">
defineProps<{
  models: any[]
}>()

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-300 hover:border-accent/30">
    <div class="flex items-center gap-2 mb-5">
      <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h3 class="text-sm font-medium text-text-secondary" style="font-family: var(--font-heading)">Running Models</h3>
    </div>

    <!-- Empty state -->
    <div v-if="models.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
      <svg class="w-12 h-12 text-text-secondary/20 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="2" y="6" width="20" height="12" rx="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 10h.01M10 10h.01" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        <path d="M14 10h4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p class="text-sm text-text-secondary/60">No models loaded in memory</p>
    </div>

    <!-- Models list -->
    <div v-else class="flex flex-wrap gap-3">
      <div
        v-for="model in models"
        :key="model.name"
        class="flex items-center gap-3 bg-bg-tertiary border border-border rounded-xl px-4 py-3"
      >
        <span class="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_#22c55e] shrink-0" />
        <span class="font-medium text-sm">{{ model.name }}</span>
        <span class="text-xs text-text-secondary bg-bg-secondary rounded-full px-2 py-0.5">{{ formatSize(model.size) }}</span>
      </div>
    </div>
  </div>
</template>
