<script setup lang="ts">
const props = defineProps<{
  cpu: { used_percent: number }
  ram: { used_mb: number; total_mb: number }
  gpu: { name: string; vram_used_mb?: number; vram_total_mb?: number; load_percent?: number; temp_celsius?: number } | null
}>()

function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function percentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

function barColor(pct: number): string {
  if (pct >= 90) return 'bg-danger'
  if (pct >= 75) return 'bg-warning'
  return 'bg-accent'
}

function badgeColor(pct: number): string {
  if (pct >= 90) return 'text-danger'
  if (pct >= 75) return 'text-warning'
  return 'text-accent'
}
</script>

<template>
  <div class="bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-300 hover:border-accent/30">
    <div class="flex items-center gap-2 mb-5">
      <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h3 class="text-sm font-medium text-text-secondary" style="font-family: var(--font-heading)">System Resources</h3>
    </div>

    <!-- CPU -->
    <div class="mb-5">
      <div class="flex justify-between items-center text-sm mb-2">
        <span class="text-text-primary font-medium">CPU</span>
        <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-bg-tertiary" :class="badgeColor(cpu.used_percent)">
          {{ cpu.used_percent }}%
        </span>
      </div>
      <div class="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div
            class="h-full rounded-full transition-all duration-500"
            :class="barColor(cpu.used_percent)"
            :style="{ width: `${cpu.used_percent}%` }"
        />
      </div>
    </div>

    <!-- RAM -->
    <div class="mb-5">
      <div class="flex justify-between items-center text-sm mb-2">
        <span class="text-text-primary font-medium">RAM</span>
        <div class="flex items-center gap-2">
          <span class="text-text-secondary text-xs">{{ formatMB(ram.used_mb) }} / {{ formatMB(ram.total_mb) }}</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-bg-tertiary" :class="badgeColor(percentage(ram.used_mb, ram.total_mb))">
            {{ percentage(ram.used_mb, ram.total_mb) }}%
          </span>
        </div>
      </div>
      <div class="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div
            class="h-full rounded-full transition-all duration-500"
            :class="barColor(percentage(ram.used_mb, ram.total_mb))"
            :style="{ width: `${percentage(ram.used_mb, ram.total_mb)}%` }"
        />
      </div>
    </div>

    <!-- GPU: discrete card (VRAM used/total), e.g. nvidia-smi hosts -->
    <div v-if="gpu && gpu.vram_total_mb !== undefined">
      <div class="flex justify-between items-center text-sm mb-2">
        <span class="text-text-primary font-medium">{{ gpu.name }}</span>
        <div class="flex items-center gap-2">
          <span class="text-text-secondary text-xs">{{ formatMB(gpu.vram_used_mb ?? 0) }} / {{ formatMB(gpu.vram_total_mb) }}</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-bg-tertiary" :class="badgeColor(percentage(gpu.vram_used_mb ?? 0, gpu.vram_total_mb))">
            {{ percentage(gpu.vram_used_mb ?? 0, gpu.vram_total_mb) }}%
          </span>
        </div>
      </div>
      <div class="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div
            class="h-full rounded-full transition-all duration-500"
            :class="barColor(percentage(gpu.vram_used_mb ?? 0, gpu.vram_total_mb))"
            :style="{ width: `${percentage(gpu.vram_used_mb ?? 0, gpu.vram_total_mb)}%` }"
        />
      </div>
    </div>

    <!-- GPU: integrated card (load %), e.g. Jetson/Tegra hosts -->
    <div v-else-if="gpu && gpu.load_percent !== undefined">
      <div class="flex justify-between items-center text-sm mb-2">
        <span class="text-text-primary font-medium">{{ gpu.name }}</span>
        <div class="flex items-center gap-2">
          <span class="text-text-secondary text-xs">load</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-bg-tertiary" :class="badgeColor(gpu.load_percent)">
            {{ gpu.load_percent }}%
          </span>
        </div>
      </div>
      <div class="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div
            class="h-full rounded-full transition-all duration-500"
            :class="barColor(gpu.load_percent)"
            :style="{ width: `${gpu.load_percent}%` }"
        />
      </div>
    </div>

    <!-- GPU: temp-only fallback, e.g. Tegra host without the load-% textfile-collector script yet -->
    <div v-else-if="gpu && gpu.temp_celsius !== undefined" class="flex items-center justify-between text-sm">
      <span class="text-text-primary font-medium">{{ gpu.name }}</span>
      <span class="text-text-secondary text-xs">{{ gpu.temp_celsius }}°C (load % unavailable)</span>
    </div>

    <div v-else class="flex items-center gap-2 text-sm text-text-secondary/60">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.97L13.74 4.36a2 2 0 00-3.5 0L3.32 16.03A2 2 0 005.07 19z" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      No GPU detected
    </div>
  </div>
</template>