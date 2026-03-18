<script setup lang="ts">
defineProps<{
  count: number
  totalSize: number
}>()

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-300 hover:border-accent/30">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h3 class="text-sm font-medium text-text-secondary">Installed Models</h3>
    </div>
    <div class="text-4xl font-bold" style="font-family: var(--font-heading)">{{ count }}</div>
    <p class="text-sm text-text-secondary mt-1">models installed</p>
    <div class="mt-4 flex items-center gap-2 text-xs text-text-secondary">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9 12h6M12 9v6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Disk: {{ formatSize(totalSize) }}
    </div>
  </div>
</template>
