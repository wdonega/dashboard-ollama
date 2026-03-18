<script setup lang="ts">
defineProps<{
  role: 'user' | 'assistant' | 'system'
  content: string
}>()
</script>

<template>
  <div
    class="flex gap-3 py-3"
    :class="role === 'user' ? 'justify-end' : ''"
  >
    <div
      class="max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap"
      :class="{
        'bg-accent/20 text-text-primary': role === 'user',
        'bg-bg-tertiary text-text-primary': role === 'assistant',
        'bg-warning/10 text-warning text-xs': role === 'system',
      }"
    >
      {{ content }}
    </div>
  </div>
</template>
