interface ApiRequest {
  endpoint: string
  method: string
  body: string
  timestamp: number
}

interface ApiResponse {
  status: number
  data: string
  duration: number
  isStreaming: boolean
}

interface HistoryEntry {
  request: ApiRequest
  response: ApiResponse
}

export const useApiTesterStore = defineStore('apiTester', () => {
  const currentEndpoint = ref('/api/generate')
  const currentMethod = ref('POST')
  const currentBody = ref('{\n  "model": "",\n  "prompt": ""\n}')

  const response = ref<ApiResponse | null>(null)
  const isLoading = ref(false)
  const history = ref<HistoryEntry[]>([])

  const availableEndpoints = [
    { value: '/api/generate', method: 'POST', label: '/api/generate' },
    { value: '/api/chat', method: 'POST', label: '/api/chat' },
    { value: '/api/embeddings', method: 'POST', label: '/api/embeddings' },
    { value: '/api/tags', method: 'GET', label: '/api/tags' },
    { value: '/api/show', method: 'POST', label: '/api/show' },
    { value: '/api/ps', method: 'GET', label: '/api/ps' },
  ]

  function addToHistory(request: ApiRequest, resp: ApiResponse) {
    history.value.unshift({ request, response: resp })
    if (history.value.length > 50) history.value.pop()
  }

  function clearHistory() {
    history.value = []
  }

  return {
    currentEndpoint, currentMethod, currentBody, response, isLoading,
    history, availableEndpoints,
    addToHistory, clearHistory,
  }
})
