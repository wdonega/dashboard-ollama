<script setup lang="ts">
defineProps<{
  modelfile: string
}>()
</script>

<template>
  <div class="flex flex-col h-full border border-border rounded-lg bg-bg-secondary overflow-hidden">
    <div class="px-3 py-2 border-b border-border bg-bg-tertiary">
      <h4 class="text-sm font-medium text-text-secondary">Modelfile Preview</h4>
    </div>
    <pre class="flex-1 overflow-y-auto px-4 py-3 text-sm font-mono whitespace-pre-wrap text-text-primary/80 min-h-0">{{ modelfile || '(empty)' }}</pre>
  </div>
</template>
