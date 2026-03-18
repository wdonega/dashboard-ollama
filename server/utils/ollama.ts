import type { H3Event } from 'h3'

export function getOllamaHost(event: H3Event): string {
  const config = useRuntimeConfig(event)
  return config.ollamaHost || 'http://localhost:11434'
}

export async function ollamaFetch(event: H3Event, path: string, options: RequestInit = {}) {
  const host = getOllamaHost(event)
  const url = `${host}${path}`

  const isStreaming = path.includes('pull') || path.includes('create') || path.includes('chat')

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: isStreaming ? undefined : AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error')
    throw createError({
      statusCode: response.status,
      statusMessage: error,
    })
  }

  return response
}
