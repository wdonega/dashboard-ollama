<script setup lang="ts">
const modelfile = defineModel<string>({ required: true })
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-text-secondary mb-1">Modelfile</label>
    <textarea
      v-model="modelfile"
      rows="16"
      class="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-sm text-text-primary font-mono focus:outline-none focus:border-accent resize-y leading-relaxed"
      placeholder='FROM llama3:8b
SYSTEM """You are a helpful assistant."""
PARAMETER temperature 0.7'
      spellcheck="false"
    />
  </div>
</template>
