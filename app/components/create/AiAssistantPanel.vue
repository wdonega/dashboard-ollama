<script setup lang="ts">
const props = defineProps<{
  assistant: ReturnType<typeof useModelfileAssistant>
}>()

const emit = defineEmits<{
  apply: [modelfile: string]
  close: []
}>()

const modelsStore = useModelsStore()
const {
  messages,
  assistantModel,
  isStreaming,
  streamingContent,
  lastGeneratedModelfile,
  sendMessage,
  abort,
  reset,
} = props.assistant

const userInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const modelNames = computed(() => modelsStore.models.map(m => m.name))

// Auto-select first model if none selected
watch(modelNames, (names) => {
  if (!assistantModel.value && names.length > 0) {
    assistantModel.value = names[0]!
  }
}, { immediate: true })

// Auto-scroll on new content
watch([messages, streamingContent], () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})

// Check if FROM model is installed
const fromModelWarning = computed(() => {
  if (!lastGeneratedModelfile.value) return ''
  const fromMatch = lastGeneratedModelfile.value.match(/^FROM\s+(\S+)/im)
  if (!fromMatch) return ''
  const fromModel = fromMatch[1]
  const installed = modelsStore.models.some(m => m.name === fromModel || m.name.startsWith(fromModel + ':'))
  return installed ? '' : `Base model "${fromModel}" is not installed locally`
})

function handleSend() {
  const text = userInput.value.trim()
  if (!text || isStreaming.value) return
  userInput.value = ''
  sendMessage(text)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleApply() {
  emit('apply', lastGeneratedModelfile.value)
}
</script>

<template>
  <div class="flex flex-col h-full border border-border rounded-lg bg-bg-secondary overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-2 border-b border-border bg-bg-tertiary">
      <select
        v-model="assistantModel"
        class="flex-1 bg-bg-secondary border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="" disabled>Select model...</option>
        <option v-for="name in modelNames" :key="name" :value="name">{{ name }}</option>
      </select>
      <button
        class="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-bg-secondary transition-colors"
        title="Clear conversation"
        @click="reset"
      >
        Clear
      </button>
      <button
        class="text-text-secondary hover:text-text-primary px-1.5 py-1 rounded hover:bg-bg-secondary transition-colors"
        title="Close assistant"
        @click="emit('close')"
      >
        &times;
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
      <div v-if="messages.length === 0 && !streamingContent" class="text-sm text-text-secondary/60 text-center mt-8">
        Describe the model you want to create and the AI will generate a Modelfile for you.
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap"
          :class="msg.role === 'user'
            ? 'bg-accent/20 text-text-primary'
            : 'bg-bg-tertiary text-text-primary'"
        >
          {{ msg.content }}
        </div>
      </div>

      <!-- Streaming -->
      <div v-if="streamingContent" class="flex justify-start">
        <div class="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap bg-bg-tertiary text-text-primary">
          {{ streamingContent }}<span class="animate-pulse">|</span>
        </div>
      </div>
    </div>

    <!-- Apply button -->
    <div v-if="lastGeneratedModelfile && !isStreaming" class="px-3 py-2 border-t border-border">
      <p v-if="fromModelWarning" class="text-xs text-yellow-400 mb-1">{{ fromModelWarning }}</p>
      <button
        class="w-full px-3 py-1.5 bg-accent text-black text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        @click="handleApply"
      >
        Apply to Editor
      </button>
    </div>

    <!-- Input -->
    <div class="px-3 py-2 border-t border-border">
      <div class="flex gap-2">
        <textarea
          v-model="userInput"
          rows="2"
          placeholder="Describe your model..."
          class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-accent"
          :disabled="isStreaming"
          @keydown="handleKeydown"
        />
        <button
          v-if="isStreaming"
          class="self-end px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
          @click="abort"
        >
          Stop
        </button>
        <button
          v-else
          class="self-end px-3 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          :disabled="!userInput.trim() || !assistantModel"
          @click="handleSend"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>
