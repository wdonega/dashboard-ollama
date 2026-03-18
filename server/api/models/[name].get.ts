export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Model name is required' })
  }

  const res = await ollamaFetch(event, '/api/show', {
    method: 'POST',
    body: JSON.stringify({ name: decodeURIComponent(name) }),
  })
  return await res.json()
})
