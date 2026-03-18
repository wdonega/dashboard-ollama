export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.model || !body?.messages) {
    throw createError({ statusCode: 400, statusMessage: 'Model and messages are required' })
  }

  const host = getOllamaHost(event)
  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: body.model,
      messages: body.messages,
      stream: true,
      options: body.options || {},
    }),
  })

  if (!response.ok || !response.body) {
    const error = await response.text().catch(() => 'Chat failed')
    throw createError({ statusCode: response.status, statusMessage: error })
  }

  setResponseHeader(event, 'Content-Type', 'application/x-ndjson')
  return sendStream(event, response.body)
})
