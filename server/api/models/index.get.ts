export default defineEventHandler(async (event) => {
  const res = await ollamaFetch(event, '/api/tags')
  return await res.json()
})
