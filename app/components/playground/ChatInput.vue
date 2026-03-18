<script setup lang="ts">
const message = ref('')
const emit = defineEmits<{
  send: [message: string]
}>()

defineProps<{
  disabled: boolean
}>()

function handleSend() {
  const text = message.value.trim()
  if (!text) return
  emit('send', text)
  message.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="border-t border-border p-4">
    <div class="flex gap-2">
      <textarea
        v-model="message"
        rows="2"
        class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent resize-none"
        placeholder="Type a message... (Shift+Enter for new line)"
        :disabled="disabled"
        @keydown="handleKeydown"
      />
      <button
        class="px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 self-end"
        :disabled="disabled || !message.trim()"
        @click="handleSend"
      >
        Send
      </button>
    </div>
  </div>
</template>
