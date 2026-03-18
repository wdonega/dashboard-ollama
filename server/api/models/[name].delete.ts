export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Model name is required' })
  }

  await ollamaFetch(event, '/api/delete', {
    method: 'DELETE',
    body: JSON.stringify({ name: decodeURIComponent(name) }),
  })
  return { success: true }
})
