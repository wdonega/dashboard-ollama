<script setup lang="ts">
const store = useApiTesterStore()
const modelsStore = useModelsStore()
const builder = useRequestBuilder()

const emit = defineEmits<{
  send: []
}>()

defineProps<{
  disabled: boolean
}>()

const mode = ref<'visual' | 'json'>('visual')
const jsonError = ref('')

onMounted(() => {
  modelsStore.fetchModels()
  // Initialize builder from current body
  builder.fromJSON(store.currentEndpoint, store.currentBody)
})

function validateJson() {
  if (store.currentMethod === 'GET') {
    jsonError.value = ''
    return
  }
  try {
    if (store.currentBody.trim()) {
      JSON.parse(store.currentBody)
    }
    jsonError.value = ''
  } catch (e: any) {
    jsonError.value = e.message
  }
}

watch(() => store.currentBody, validateJson)

function selectEndpoint(endpoint: typeof store.availableEndpoints[0]) {
  store.currentEndpoint = endpoint.value
  store.currentMethod = endpoint.method
  builder.resetForEndpoint(endpoint.value)
  if (mode.value === 'visual') {
    store.currentBody = builder.toJSON(endpoint.value)
  }
}

function switchMode(newMode: 'visual' | 'json') {
  if (newMode === mode.value) return

  if (newMode === 'json') {
    // Visual → JSON: serialize builder state
    store.currentBody = builder.toJSON(store.currentEndpoint)
  } else {
    // JSON → Visual: parse JSON into builder
    builder.fromJSON(store.currentEndpoint, store.currentBody)
  }

  mode.value = newMode
}

// Sync builder changes to store body in visual mode
function syncToStore() {
  if (mode.value === 'visual') {
    store.currentBody = builder.toJSON(store.currentEndpoint)
  }
}

// Watch all builder fields
watch([builder.model, builder.prompt, builder.systemPrompt, builder.messages, builder.options, builder.stream, builder.format], syncToStore, { deep: true })

const showPrompt = computed(() =>
  ['/api/generate', '/api/embeddings'].includes(store.currentEndpoint)
)
const showSystemPrompt = computed(() =>
  store.currentEndpoint === '/api/generate'
)
const showMessages = computed(() =>
  store.currentEndpoint === '/api/chat'
)
const showOptions = computed(() =>
  ['/api/generate', '/api/chat'].includes(store.currentEndpoint)
)
const showStream = computed(() =>
  ['/api/generate', '/api/chat'].includes(store.currentEndpoint)
)
const showFormat = computed(() =>
  ['/api/generate', '/api/chat'].includes(store.currentEndpoint)
)
const showModel = computed(() =>
  store.currentMethod !== 'GET'
)
const isGet = computed(() => store.currentMethod === 'GET')
</script>

<template>
  <div class="flex flex-col h-full">
    <h3 class="text-sm font-medium text-text-secondary mb-3">Request</h3>

    <!-- Endpoint selector -->
    <div class="flex gap-2 mb-3">
      <select
        class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-all duration-200"
        @change="selectEndpoint(store.availableEndpoints[($event.target as HTMLSelectElement).selectedIndex]!)"
      >
        <option
          v-for="ep in store.availableEndpoints"
          :key="ep.value"
          :value="ep.value"
          :selected="ep.value === store.currentEndpoint"
        >
          {{ ep.method }} {{ ep.label }}
        </option>
      </select>
    </div>

    <!-- Visual / JSON toggle -->
    <div v-if="!isGet" class="flex gap-1 mb-3 bg-bg-tertiary rounded-lg p-1 w-fit">
      <button
        class="px-4 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer"
        :class="mode === 'visual' ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'"
        @click="switchMode('visual')"
      >
        Visual
      </button>
      <button
        class="px-4 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer"
        :class="mode === 'json' ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'"
        @click="switchMode('json')"
      >
        JSON
      </button>
    </div>

    <!-- Visual mode -->
    <div v-if="mode === 'visual' && !isGet" class="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
      <!-- Model block -->
      <div v-if="showModel" class="bg-bg-tertiary border border-border rounded-2xl p-3">
        <label class="block text-xs font-heading text-text-secondary mb-1.5">Model</label>
        <select
          v-model="builder.model.value"
          class="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-all duration-200"
        >
          <option value="" disabled>Select a model</option>
          <option v-for="m in modelsStore.models" :key="m.name" :value="m.name">
            {{ m.name }}
          </option>
        </select>
      </div>

      <!-- Prompt block -->
      <div v-if="showPrompt" class="bg-bg-tertiary border border-border rounded-2xl p-3">
        <label class="block text-xs font-heading text-text-secondary mb-1.5">Prompt</label>
        <textarea
          v-model="builder.prompt.value"
          rows="3"
          class="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none transition-all duration-200"
          placeholder="Enter your prompt..."
        />
      </div>

      <!-- System Prompt block -->
      <div v-if="showSystemPrompt" class="bg-bg-tertiary border border-border rounded-2xl p-3">
        <label class="block text-xs font-heading text-text-secondary mb-1.5">System Prompt</label>
        <textarea
          v-model="builder.systemPrompt.value"
          rows="2"
          class="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none transition-all duration-200"
          placeholder="Optional system prompt..."
        />
      </div>

      <!-- Messages block (chat) -->
      <div v-if="showMessages" class="bg-bg-tertiary border border-border rounded-2xl p-3">
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-heading text-text-secondary">Messages</label>
          <button
            class="text-xs text-accent hover:text-accent-hover cursor-pointer transition-all duration-200"
            @click="builder.addMessage()"
          >
            + Add
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(msg, i) in builder.messages.value"
            :key="i"
            class="flex gap-2 items-start"
          >
            <select
              v-model="msg.role"
              class="bg-bg-secondary border border-border rounded-lg px-2 py-2 text-xs text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-all duration-200 w-24 shrink-0"
            >
              <option value="user">user</option>
              <option value="assistant">assistant</option>
              <option value="system">system</option>
            </select>
            <textarea
              v-model="msg.content"
              rows="2"
              class="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none transition-all duration-200"
              placeholder="Message content..."
            />
            <button
              v-if="builder.messages.value.length > 1"
              class="text-text-secondary hover:text-danger cursor-pointer transition-all duration-200 mt-2 shrink-0"
              @click="builder.removeMessage(i)"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      <!-- Options block -->
      <div v-if="showOptions" class="bg-bg-tertiary border border-border rounded-2xl p-3">
        <label class="block text-xs font-heading text-text-secondary mb-1.5">Options</label>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-[10px] text-text-secondary mb-1">Temperature</label>
            <input
              v-model="builder.options.value.temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              class="w-full bg-bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-all duration-200"
              placeholder="0-2"
            />
          </div>
          <div>
            <label class="block text-[10px] text-text-secondary mb-1">Top P</label>
            <input
              v-model="builder.options.value.top_p"
              type="number"
              min="0"
              max="1"
              step="0.1"
              class="w-full bg-bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-all duration-200"
              placeholder="0-1"
            />
          </div>
          <div>
            <label class="block text-[10px] text-text-secondary mb-1">Max Tokens</label>
            <input
              v-model="builder.options.value.num_predict"
              type="number"
              min="1"
              class="w-full bg-bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-all duration-200"
              placeholder="e.g. 512"
            />
          </div>
        </div>
      </div>

      <!-- Stream toggle -->
      <div v-if="showStream" class="bg-bg-tertiary border border-border rounded-2xl p-3 flex items-center justify-between">
        <label class="text-xs font-heading text-text-secondary">Stream</label>
        <button
          class="relative w-10 h-5 rounded-full transition-all duration-200 cursor-pointer"
          :class="builder.stream.value ? 'bg-accent' : 'bg-border'"
          @click="builder.stream.value = !builder.stream.value"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200"
            :class="builder.stream.value ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Format dropdown -->
      <div v-if="showFormat" class="bg-bg-tertiary border border-border rounded-2xl p-3">
        <label class="block text-xs font-heading text-text-secondary mb-1.5">Format</label>
        <select
          v-model="builder.format.value"
          class="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-all duration-200"
        >
          <option value="">Text (default)</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </div>

    <!-- JSON mode -->
    <div v-else-if="!isGet" class="flex-1 min-h-0 flex flex-col">
      <label class="text-xs text-text-secondary mb-1">Body (JSON)</label>
      <textarea
        v-model="store.currentBody"
        class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent resize-none"
        :class="jsonError ? 'border-danger' : ''"
        spellcheck="false"
        placeholder="{ }"
      />
      <p v-if="jsonError" class="text-xs text-danger mt-1">{{ jsonError }}</p>
    </div>

    <!-- GET placeholder -->
    <div v-if="isGet" class="flex-1 min-h-0 flex items-center justify-center text-text-secondary text-sm">
      No body for GET requests
    </div>

    <button
      class="mt-3 w-full py-2.5 bg-accent text-black text-sm font-medium rounded-lg cursor-pointer hover:bg-accent-hover transition-all duration-200 disabled:opacity-50"
      :disabled="disabled || !!jsonError"
      @click="emit('send')"
    >
      Send Request
    </button>
  </div>
</template>
