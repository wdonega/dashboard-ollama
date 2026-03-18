<script setup lang="ts">
defineProps<{
  response: {
    status: number
    data: string
    duration: number
    isStreaming: boolean
  } | null
  streamingData: string
  isLoading: boolean
}>()

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-sm font-medium text-text-secondary">Response</h3>
      <div v-if="response" class="flex gap-3 text-xs text-text-secondary">
        <span :class="response.status < 400 ? 'text-accent' : 'text-danger'">
          {{ response.status }}
        </span>
        <span>{{ response.duration }}ms</span>
      </div>
    </div>
    <div class="flex-1 min-h-0 overflow-auto bg-bg-tertiary border border-border rounded-lg p-3">
      <div v-if="isLoading && !streamingData" class="text-text-secondary text-sm">
        Waiting for response...
      </div>
      <pre v-else-if="streamingData" class="text-sm font-mono whitespace-pre-wrap text-text-primary">{{ streamingData }}</pre>
      <pre v-else-if="response" class="text-sm font-mono whitespace-pre-wrap text-text-primary">{{ formatJson(response.data) }}</pre>
      <div v-else class="text-text-secondary text-sm">
        Send a request to see the response
      </div>
    </div>
  </div>
</template>
