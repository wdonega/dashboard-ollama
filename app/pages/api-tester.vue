<script setup lang="ts">
const store = useApiTesterStore()
const toast = useToast()
const streamingData = ref('')

async function sendRequest() {
  const { currentEndpoint, currentMethod, currentBody } = store
  store.isLoading = true
  store.response = null
  streamingData.value = ''

  let body: any = undefined
  if (currentMethod !== 'GET' && currentBody.trim()) {
    try {
      body = JSON.parse(currentBody)
    } catch {
      toast.error('Invalid JSON body')
      store.isLoading = false
      return
    }
  }

  const startTime = Date.now()

  try {
    const response = await fetch('/api/raw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: currentEndpoint,
        method: currentMethod,
        body,
      }),
    })

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('ndjson') && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        streamingData.value += decoder.decode(value, { stream: true })
      }

      const duration = Date.now() - startTime
      const resp = { status: response.status, data: streamingData.value, duration, isStreaming: true }
      store.response = resp
      store.addToHistory(
        { endpoint: currentEndpoint, method: currentMethod, body: currentBody, timestamp: startTime },
        resp,
      )
    } else {
      const data = await response.text()
      const duration = Date.now() - startTime
      const resp = { status: response.status, data, duration, isStreaming: false }
      store.response = resp
      store.addToHistory(
        { endpoint: currentEndpoint, method: currentMethod, body: currentBody, timestamp: startTime },
        resp,
      )
    }
  } catch (err: any) {
    const duration = Date.now() - startTime
    store.response = { status: 0, data: err.message, duration, isStreaming: false }
    toast.error(`Request failed: ${err.message}`)
  } finally {
    store.isLoading = false
  }
}

function selectFromHistory(entry: any) {
  store.currentEndpoint = entry.request.endpoint
  store.currentMethod = entry.request.method
  store.currentBody = entry.request.body
  store.response = entry.response
  streamingData.value = entry.response.isStreaming ? entry.response.data : ''
}
</script>

<template>
  <div class="flex flex-col" style="height: calc(100vh - 3rem)">
    <h2 class="text-2xl font-bold mb-4 shrink-0" style="font-family: var(--font-heading)">API Tester</h2>
    <div class="flex-1 min-h-0 grid grid-cols-2 gap-4 [&>*]:min-h-0">
      <ApiTesterRequestPanel :disabled="store.isLoading" @send="sendRequest" />
      <ApiTesterResponsePanel
        :response="store.response"
        :streaming-data="streamingData"
        :is-loading="store.isLoading"
      />
    </div>
    <div class="shrink-0 mt-3">
      <ApiTesterRequestHistory @select="selectFromHistory" />
    </div>
  </div>
</template>
