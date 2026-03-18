const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60_000

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string) || ''
  const page = parseInt(query.page as string) || 1

  const cacheKey = `${q}:${page}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const searchUrl = `https://ollama.com/search?q=${encodeURIComponent(q)}&p=${page}`
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'OllamaDashboard/1.0' },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      throw new Error(`Ollama registry returned ${response.status}`)
    }

    const html = await response.text()
    const models = parseOllamaSearchResults(html)

    const result = { models, query: q, page }
    cache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  } catch (error: any) {
    throw createError({
      statusCode: 503,
      statusMessage: `Registry search unavailable: ${error.message}. Use direct pull instead.`,
    })
  }
})

function parseOllamaSearchResults(html: string) {
  const models: Array<{ name: string; description: string; tags: string[] }> = []

  const itemRegex = /<a[^>]*href="\/library\/([^"]+)"[^>]*>[\s\S]*?<\/a>/gi
  const nameRegex = /<h2[^>]*>([^<]+)<\/h2>/i
  const descRegex = /<p[^>]*class="[^"]*"[^>]*>([^<]*)<\/p>/i

  let match
  while ((match = itemRegex.exec(html)) !== null) {
    const block = match[0]
    const slug = match[1]
    const nameMatch = nameRegex.exec(block)
    const descMatch = descRegex.exec(block)

    models.push({
      name: slug || (nameMatch?.[1]?.trim() ?? 'unknown'),
      description: descMatch?.[1]?.trim() ?? '',
      tags: [],
    })
  }

  return models
}
