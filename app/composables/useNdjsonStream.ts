interface StreamOptions {
  onChunk: (data: any) => void
  onError?: (error: Error) => void
  onDone?: () => void
  inactivityTimeout?: number
}

export function useNdjsonStream() {
  const isStreaming = ref(false)
  let abortController: AbortController | null = null

  async function start(url: string, body: any, options: StreamOptions) {
    const timeout = options.inactivityTimeout ?? 30_000
    abortController = new AbortController()
    isStreaming.value = true

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })

      if (!response.ok || !response.body) {
        const errorText = await response.text().catch(() => 'Stream failed')
        throw new Error(errorText)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let inactivityTimer: ReturnType<typeof setTimeout> | null = null

      const resetTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer)
        inactivityTimer = setTimeout(() => {
          abort()
          options.onError?.(new Error('Stream timed out: no data received for 30s'))
        }, timeout)
      }

      resetTimer()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        resetTimer()
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              options.onChunk(data)
            } catch {
              // Skip malformed lines
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          options.onChunk(JSON.parse(buffer))
        } catch {
          // Skip
        }
      }

      if (inactivityTimer) clearTimeout(inactivityTimer)
      options.onDone?.()
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        options.onError?.(error)
      }
    } finally {
      isStreaming.value = false
      abortController = null
    }
  }

  function abort() {
    abortController?.abort()
    isStreaming.value = false
  }

  return { isStreaming: readonly(isStreaming), start, abort }
}
