<script setup lang="ts">
defineProps<{
  messages: Array<{ role: string; content: string }>
  streamingContent: string
  isStreaming: boolean
}>()

const container = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  })
}

defineExpose({ scrollToBottom })
</script>

<template>
  <div
    ref="container"
    class="flex-1 overflow-y-auto p-4 space-y-1"
  >
    <div v-if="messages.length === 0" class="flex items-center justify-center h-full text-text-secondary text-sm">
      Start a conversation...
    </div>

    <PlaygroundChatMessage
      v-for="(msg, i) in messages"
      :key="i"
      :role="msg.role as any"
      :content="msg.content"
    />

    <PlaygroundChatMessage
      v-if="isStreaming && streamingContent"
      role="assistant"
      :content="streamingContent"
    />
    <div v-if="isStreaming && !streamingContent" class="flex gap-1 py-3 px-4">
      <span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 0ms" />
      <span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 150ms" />
      <span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 300ms" />
    </div>
  </div>
</template>
