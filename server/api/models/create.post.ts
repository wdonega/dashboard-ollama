function parseModelfile(modelfile: string) {
  const result: Record<string, any> = {}
  const parameters: Record<string, string | number> = {}

  // Pre-process: extract multi-line triple-quoted blocks
  // Replace INSTRUCTION """...""" spanning multiple lines into single-line tokens
  const processed = modelfile.replace(
    /^(FROM|SYSTEM|TEMPLATE|LICENSE)\s+"""([\s\S]*?)"""/gim,
    (_, instruction, content) => `${instruction} __BLOCK__${content}__ENDBLOCK__`,
  )

  const lines = processed.split('\n')
  let i = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed || trimmed.startsWith('#')) { i++; continue }

    const upperLine = trimmed.toUpperCase()

    if (upperLine.startsWith('FROM ')) {
      result.from = trimmed.slice(5).trim()
    } else if (upperLine.startsWith('SYSTEM ')) {
      result.system = extractValue(trimmed.slice(7))
    } else if (upperLine.startsWith('TEMPLATE ')) {
      result.template = extractValue(trimmed.slice(9))
    } else if (upperLine.startsWith('PARAMETER ')) {
      const paramStr = trimmed.slice(10).trim()
      const spaceIdx = paramStr.indexOf(' ')
      if (spaceIdx > 0) {
        const key = paramStr.slice(0, spaceIdx)
        const val = paramStr.slice(spaceIdx + 1).trim()
        parameters[key] = isNaN(Number(val)) ? val : Number(val)
      }
    } else if (upperLine.startsWith('LICENSE ')) {
      result.license = extractValue(trimmed.slice(8))
    }

    i++
  }

  if (Object.keys(parameters).length > 0) {
    result.parameters = parameters
  }

  return result
}

function extractValue(raw: string): string {
  const trimmed = raw.trim()

  // Handle pre-processed multi-line block
  if (trimmed.startsWith('__BLOCK__') && trimmed.includes('__ENDBLOCK__')) {
    return trimmed.slice(9, trimmed.indexOf('__ENDBLOCK__'))
  }

  // Handle triple-quoted single-line
  if (trimmed.startsWith('"""') && trimmed.endsWith('"""') && trimmed.length > 6) {
    return trimmed.slice(3, -3)
  }

  // Handle regular quoted strings
  if ((trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length > 1)) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || !body?.modelfile) {
    throw createError({ statusCode: 400, statusMessage: 'Name and modelfile are required' })
  }

  const parsed = parseModelfile(body.modelfile)

  if (!parsed.from) {
    throw createError({ statusCode: 400, statusMessage: 'Modelfile must contain a FROM instruction' })
  }

  const createBody = {
    model: body.name,
    stream: true,
    ...parsed,
  }

  const host = getOllamaHost(event)
  const response = await fetch(`${host}/api/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createBody),
  })

  if (!response.ok || !response.body) {
    const error = await response.text().catch(() => 'Create failed')
    throw createError({ statusCode: response.status, statusMessage: error })
  }

  setResponseHeader(event, 'Content-Type', 'application/x-ndjson')
  return sendStream(event, response.body)
})
