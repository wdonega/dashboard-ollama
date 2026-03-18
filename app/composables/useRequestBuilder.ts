interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface BuilderOptions {
  temperature: string
  top_p: string
  num_predict: string
}

export function useRequestBuilder() {
  const model = ref('')
  const prompt = ref('')
  const systemPrompt = ref('')
  const messages = ref<ChatMessage[]>([{ role: 'user', content: '' }])
  const options = ref<BuilderOptions>({ temperature: '', top_p: '', num_predict: '' })
  const stream = ref(true)
  const format = ref<'' | 'json'>('')

  function toJSON(endpoint: string): string {
    const obj: Record<string, unknown> = {}

    if (endpoint === '/api/tags' || endpoint === '/api/ps') return ''

    if (endpoint === '/api/show') {
      obj.model = model.value
      return JSON.stringify(obj, null, 2)
    }

    obj.model = model.value

    if (endpoint === '/api/generate') {
      obj.prompt = prompt.value
      if (systemPrompt.value) obj.system = systemPrompt.value
    }

    if (endpoint === '/api/chat') {
      obj.messages = messages.value
        .filter(m => m.content.trim())
        .map(m => ({ role: m.role, content: m.content }))
    }

    if (endpoint === '/api/embeddings') {
      obj.prompt = prompt.value
      return JSON.stringify(obj, null, 2)
    }

    // Options
    const opts: Record<string, number> = {}
    if (options.value.temperature) opts.temperature = parseFloat(options.value.temperature)
    if (options.value.top_p) opts.top_p = parseFloat(options.value.top_p)
    if (options.value.num_predict) opts.num_predict = parseInt(options.value.num_predict)
    if (Object.keys(opts).length) obj.options = opts

    obj.stream = stream.value
    if (format.value) obj.format = format.value

    return JSON.stringify(obj, null, 2)
  }

  function fromJSON(endpoint: string, json: string) {
    if (!json.trim()) return

    try {
      const obj = JSON.parse(json)

      model.value = obj.model || ''
      prompt.value = obj.prompt || ''
      systemPrompt.value = obj.system || ''
      stream.value = obj.stream ?? true
      format.value = obj.format || ''

      if (Array.isArray(obj.messages) && obj.messages.length) {
        messages.value = obj.messages.map((m: any) => ({
          role: m.role || 'user',
          content: m.content || '',
        }))
      } else {
        messages.value = [{ role: 'user', content: '' }]
      }

      if (obj.options) {
        options.value.temperature = obj.options.temperature?.toString() || ''
        options.value.top_p = obj.options.top_p?.toString() || ''
        options.value.num_predict = obj.options.num_predict?.toString() || ''
      } else {
        options.value = { temperature: '', top_p: '', num_predict: '' }
      }
    } catch {
      // Invalid JSON, don't update
    }
  }

  function resetForEndpoint(endpoint: string) {
    prompt.value = ''
    systemPrompt.value = ''
    messages.value = [{ role: 'user', content: '' }]
    options.value = { temperature: '', top_p: '', num_predict: '' }
    stream.value = true
    format.value = ''
  }

  function addMessage() {
    messages.value.push({ role: 'user', content: '' })
  }

  function removeMessage(index: number) {
    if (messages.value.length > 1) {
      messages.value.splice(index, 1)
    }
  }

  return {
    model, prompt, systemPrompt, messages, options, stream, format,
    toJSON, fromJSON, resetForEndpoint, addMessage, removeMessage,
  }
}
