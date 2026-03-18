interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const currentModel = ref<string>('')
  const isStreaming = ref(false)
  const streamingContent = ref('')

  const options = ref({
    temperature: 0.7,
    top_p: 0.9,
    system: '',
    num_predict: -1,
  })

  function addMessage(role: ChatMessage['role'], content: string) {
    messages.value.push({ role, content })
  }

  function clearConversation() {
    messages.value = []
    streamingContent.value = ''
  }

  function setModel(model: string) {
    currentModel.value = model
  }

  return {
    messages, currentModel, isStreaming, streamingContent, options,
    addMessage, clearConversation, setModel,
  }
})
