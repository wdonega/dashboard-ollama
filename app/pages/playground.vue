<script setup lang="ts">
const chatStore = useChatStore()
const modelsStore = useModelsStore()
const toast = useToast()
const { start, abort, isStreaming } = useNdjsonStream()
const chatWindow = ref<{ scrollToBottom: () => void } | null>(null)

onMounted(() => {
  modelsStore.fetchModels()
})

watch(isStreaming, (val) => {
  chatStore.isStreaming = val
})

async function sendMessage(content: string) {
  if (!chatStore.currentModel) {
    toast.error('Please select a model first')
    return
  }

  chatStore.addMessage('user', content)
  chatStore.streamingContent = ''
  chatWindow.value?.scrollToBottom()

  const messages = chatStore.options.system
    ? [{ role: 'system', content: chatStore.options.system }, ...chatStore.messages]
    : [...chatStore.messages]

  await start('/api/chat', {
    model: chatStore.currentModel,
    messages,
    options: {
      temperature: chatStore.options.temperature,
      top_p: chatStore.options.top_p,
      num_predict: chatStore.options.num_predict,
    },
  }, {
    onChunk(data) {
      if (data.message?.content) {
        chatStore.streamingContent += data.message.content
        chatWindow.value?.scrollToBottom()
      }
    },
    onDone() {
      if (chatStore.streamingContent) {
        chatStore.addMessage('assistant', chatStore.streamingContent)
        chatStore.streamingContent = ''
      }
    },
    onError(err) {
      toast.error(`Chat error: ${err.message}`)
      chatStore.streamingContent = ''
    },
  })
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-3rem)]">
    <div class="flex items-center gap-4 pb-4 border-b border-border">
      <h2 class="text-2xl font-bold" style="font-family: var(--font-heading)">Playground</h2>
      <select
        :value="chatStore.currentModel"
        class="bg-bg-tertiary border border-border rounded-xl px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
        @change="chatStore.setModel(($event.target as HTMLSelectElement).value)"
      >
        <option value="">Select model...</option>
        <option v-for="model in modelsStore.models" :key="model.name" :value="model.name">
          {{ model.name }}
        </option>
      </select>
      <button
        class="ml-auto px-3 py-1.5 text-sm border border-border rounded-xl text-text-secondary hover:bg-bg-tertiary cursor-pointer transition-colors duration-200"
        @click="chatStore.clearConversation()"
      >
        New Chat
      </button>
      <button
        v-if="isStreaming"
        class="px-3 py-1.5 text-sm border border-danger/30 rounded-xl text-danger hover:bg-danger/10 cursor-pointer transition-colors duration-200"
        @click="abort()"
      >
        Stop
      </button>
    </div>
    <div class="flex flex-1 min-h-0">
      <div class="flex-1 flex flex-col">
        <PlaygroundChatWindow
          ref="chatWindow"
          :messages="chatStore.messages"
          :streaming-content="chatStore.streamingContent"
          :is-streaming="chatStore.isStreaming"
        />
        <PlaygroundChatInput :disabled="isStreaming" @send="sendMessage" />
      </div>
      <PlaygroundChatOptions />
    </div>
  </div>
</template>
