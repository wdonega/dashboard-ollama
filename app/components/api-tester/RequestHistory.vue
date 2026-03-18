<script setup lang="ts">
const store = useApiTesterStore()

const emit = defineEmits<{
  select: [entry: any]
}>()

const selectedIndex = ref<number | null>(null)
const expandedIndex = ref<number | null>(null)

function selectEntry(entry: any, index: number) {
  selectedIndex.value = index
  emit('select', entry)
}

function toggleExpand(index: number, event: Event) {
  event.stopPropagation()
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function truncate(str: string, max = 200) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}
</script>

<template>
  <div class="border-t border-border pt-3">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium text-text-secondary">History</h3>
      <button
        v-if="store.history.length > 0"
        class="text-xs text-text-secondary hover:text-text-primary"
        @click="store.clearHistory(); selectedIndex = null; expandedIndex = null"
      >
        Clear
      </button>
    </div>
    <div class="space-y-1 max-h-64 overflow-y-auto">
      <div v-for="(entry, i) in store.history" :key="i">
        <button
          class="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-bg-tertiary transition-colors flex items-center gap-2"
          :class="{ 'bg-bg-tertiary': selectedIndex === i }"
          @click="selectEntry(entry, i)"
        >
          <button
            class="shrink-0 text-text-secondary hover:text-text-primary transition-colors p-0.5"
            @click="toggleExpand(i, $event)"
          >
            <svg
              class="w-3 h-3 transition-transform"
              :class="{ 'rotate-90': expandedIndex === i }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
          <span class="font-mono flex-1">{{ entry.request.method }} {{ entry.request.endpoint }}</span>
          <span class="text-text-secondary shrink-0">{{ entry.response.duration }}ms</span>
          <span class="text-text-secondary shrink-0">{{ formatTime(entry.request.timestamp) }}</span>
          <span class="shrink-0" :class="entry.response.status < 400 ? 'text-accent' : 'text-danger'">
            {{ entry.response.status }}
          </span>
        </button>
        <div v-if="expandedIndex === i" class="ml-7 mr-2 mb-1 space-y-1">
          <div v-if="entry.request.body?.trim()">
            <span class="text-[10px] font-medium text-text-secondary uppercase">Request</span>
            <pre class="font-mono text-xs text-text-secondary bg-bg-secondary rounded p-1.5 overflow-x-auto whitespace-pre-wrap break-all">{{ truncate(entry.request.body) }}</pre>
          </div>
          <div>
            <span class="text-[10px] font-medium text-text-secondary uppercase">Response</span>
            <pre class="font-mono text-xs text-text-secondary bg-bg-secondary rounded p-1.5 overflow-x-auto whitespace-pre-wrap break-all">{{ truncate(entry.response.data) }}</pre>
          </div>
        </div>
      </div>
      <div v-if="store.history.length === 0" class="text-xs text-text-secondary py-2 text-center">
        No requests yet
      </div>
    </div>
  </div>
</template>
