export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || !body?.modelfile) {
    throw createError({ statusCode: 400, statusMessage: 'Name and modelfile are required' })
  }

  const host = getOllamaHost(event)
  const response = await fetch(`${host}/api/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: body.name, modelfile: body.modelfile, stream: true }),
  })

  if (!response.ok || !response.body) {
    const error = await response.text().catch(() => 'Create failed')
    throw createError({ statusCode: response.status, statusMessage: error })
  }

  setResponseHeader(event, 'Content-Type', 'application/x-ndjson')
  return sendStream(event, response.body)
})
