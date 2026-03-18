interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ParsedModelfile {
  modelfile: string
  isValid: boolean
}

const SYSTEM_PROMPT = `You are an expert Ollama Modelfile generator. The user will describe what kind of AI model they want, and you must generate a complete, valid Ollama Modelfile.

RULES:
1. Always respond with a complete Modelfile inside a \`\`\`modelfile code block.
2. The Modelfile MUST start with a FROM instruction specifying a base model.
3. Always include a SYSTEM instruction with a detailed system prompt tailored to the user's description.
4. Include PARAMETER instructions when relevant (temperature, top_p, top_k, num_predict, repeat_penalty).
5. Only include TEMPLATE if the user has specific formatting needs.
6. Before the code block, write 1-2 sentences explaining your choices.
7. If the user asks to modify a previous Modelfile, output the complete updated Modelfile.`

function parseModelfileFromResponse(content: string): ParsedModelfile {
  // Try ```modelfile, ```text, ```dockerfile, or bare ``` blocks
  const codeBlockRegex = /```(?:modelfile|text|dockerfile)?\s*\n([\s\S]*?)```/i
  const match = content.match(codeBlockRegex)

  if (match?.[1]) {
    const modelfile = match[1].trim()
    return { modelfile, isValid: modelfile.toUpperCase().includes('FROM ') }
  }

  // Fallback: find FROM line and take everything from there
  const lines = content.split('\n')
  const fromIndex = lines.findIndex((l: string) => l.trim().toUpperCase().startsWith('FROM '))
  if (fromIndex !== -1) {
    const modelfile = lines.slice(fromIndex).join('\n').trim()
    return { modelfile, isValid: true }
  }

  return { modelfile: '', isValid: false }
}

export function useModelfileAssistant() {
  const messages = ref<AssistantMessage[]>([])
  const assistantModel = ref('')
  const streamingContent = ref('')
  const lastGeneratedModelfile = ref('')

  const { isStreaming, start, abort: abortStream } = useNdjsonStream()

  async function sendMessage(content: string) {
    if (!assistantModel.value || !content.trim()) return

    messages.value.push({ role: 'user', content: content.trim() })
    streamingContent.value = ''
    lastGeneratedModelfile.value = ''

    const chatMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.value.map(m => ({ role: m.role, content: m.content })),
    ]

    await start('/api/chat', {
      model: assistantModel.value,
      messages: chatMessages,
      options: { temperature: 0.3 },
    }, {
      onChunk(data) {
        if (data.message?.content) {
          streamingContent.value += data.message.content
        }
      },
      onDone() {
        const finalContent = streamingContent.value
        messages.value.push({ role: 'assistant', content: finalContent })

        const parsed = parseModelfileFromResponse(finalContent)
        if (parsed.isValid) {
          lastGeneratedModelfile.value = parsed.modelfile
        }

        streamingContent.value = ''
      },
      onError(err) {
        messages.value.push({ role: 'assistant', content: `Error: ${err.message}` })
        streamingContent.value = ''
      },
    })
  }

  function abort() {
    abortStream()
    if (streamingContent.value) {
      messages.value.push({ role: 'assistant', content: streamingContent.value })
      streamingContent.value = ''
    }
  }

  function reset() {
    messages.value = []
    streamingContent.value = ''
    lastGeneratedModelfile.value = ''
  }

  return {
    messages: readonly(messages),
    assistantModel,
    isStreaming,
    streamingContent: readonly(streamingContent),
    lastGeneratedModelfile: readonly(lastGeneratedModelfile),
    sendMessage,
    abort,
    reset,
  }
}
