export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.endpoint || !body?.method) {
    throw createError({ statusCode: 400, statusMessage: 'Endpoint and method are required' })
  }

  const { endpoint, method } = body
  const allowedMethods = ['GET', 'POST', 'DELETE']

  if (!allowedMethods.includes(method.toUpperCase())) {
    throw createError({ statusCode: 400, statusMessage: `Method must be one of: ${allowedMethods.join(', ')}` })
  }

  if (!endpoint.startsWith('/api/') || endpoint.includes('..') || endpoint.includes('://')) {
    throw createError({ statusCode: 400, statusMessage: 'Endpoint must start with /api/ and contain no path traversal' })
  }

  const host = getOllamaHost(event)
  const fetchOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: { 'Content-Type': 'application/json' },
  }

  if (body.body && method.toUpperCase() !== 'GET') {
    fetchOptions.body = JSON.stringify(body.body)
  }

  const response = await fetch(`${host}${endpoint}`, fetchOptions)

  const contentType = response.headers.get('content-type') || ''
  if (response.body && (contentType.includes('ndjson') || contentType.includes('octet-stream'))) {
    setResponseHeader(event, 'Content-Type', 'application/x-ndjson')
    return sendStream(event, response.body)
  }

  const data = await response.text()
  setResponseStatus(event, response.status)
  setResponseHeader(event, 'Content-Type', contentType || 'application/json')
  return data
})
