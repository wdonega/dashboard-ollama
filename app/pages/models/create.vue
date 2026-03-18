<script setup lang="ts">
const modelsStore = useModelsStore()
const toast = useToast()
const { start, isStreaming } = useNdjsonStream()

const modelName = ref('')
const activeMode = ref<'form' | 'editor'>('form')
const editorContent = ref('')
const formRef = ref<{ modelfile: string; loadModelfile: (content: string) => void } | null>(null)
const createStatus = ref('')
const rightPanel = ref<'preview' | 'assistant'>('preview')
const assistant = useModelfileAssistant()

async function applyModelfile(modelfile: string) {
  activeMode.value = 'editor'
  rightPanel.value = 'preview'
  await nextTick()
  editorContent.value = modelfile
  toast.success('Modelfile applied!')
}

onMounted(() => {
  modelsStore.fetchModels()
})

const currentModelfile = computed(() => {
  return activeMode.value === 'form'
    ? formRef.value?.modelfile || ''
    : editorContent.value
})

watch(activeMode, async (newMode, oldMode) => {
  if (newMode === 'editor' && formRef.value) {
    editorContent.value = formRef.value.modelfile
  }
  if (newMode === 'form' && oldMode === 'editor' && editorContent.value.trim()) {
    await nextTick()
    formRef.value?.loadModelfile(editorContent.value)
  }
})

async function createModel() {
  const name = modelName.value.trim()
  const modelfile = currentModelfile.value.trim()
  if (!name || !modelfile) {
    toast.error('Name and modelfile content are required')
    return
  }

  if (modelsStore.isOperationInProgress(name)) {
    toast.error(`Operation already in progress for ${name}`)
    return
  }

  createStatus.value = 'starting...'
  modelsStore.setOperation(name, { type: 'create', status: 'starting', progress: 0, total: 0 })

  await start('/api/models/create', { name, modelfile }, {
    onChunk(data) {
      createStatus.value = data.status || 'processing...'
      modelsStore.setOperation(name, {
        type: 'create',
        status: data.status || 'processing',
        progress: 0,
        total: 0,
      })
    },
    onDone() {
      modelsStore.clearOperation(name)
      modelsStore.fetchModels()
      toast.success(`Model ${name} created successfully`)
      createStatus.value = ''
    },
    onError(err) {
      modelsStore.clearOperation(name)
      createStatus.value = ''
      toast.error(`Create failed: ${err.message}`)
    },
  })
}
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/models" class="text-text-secondary hover:text-text-primary">&larr;</NuxtLink>
      <h2 class="text-2xl font-bold">Create Custom Model</h2>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-text-secondary mb-1">Model Name</label>
      <input
        v-model="modelName"
        type="text"
        placeholder="my-custom-model"
        class="w-full max-w-md bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
      />
    </div>

    <div class="flex gap-1 mb-4 bg-bg-tertiary rounded-lg p-1 w-fit">
      <button
        class="px-4 py-1.5 text-sm rounded-md transition-colors"
        :class="activeMode === 'form' ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'"
        @click="activeMode = 'form'"
      >
        Form
      </button>
      <button
        class="px-4 py-1.5 text-sm rounded-md transition-colors"
        :class="activeMode === 'editor' ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'"
        @click="activeMode = 'editor'"
      >
        Editor
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <CreateFormMode v-if="activeMode === 'form'" ref="formRef" />
        <CreateEditorMode v-else v-model="editorContent" />
      </div>
      <div>
        <div class="flex gap-1 mb-2 bg-bg-tertiary rounded-lg p-1 w-fit">
          <button
            class="px-3 py-1 text-xs rounded-md transition-colors"
            :class="rightPanel === 'preview' ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'"
            @click="rightPanel = 'preview'"
          >
            Preview
          </button>
          <button
            class="px-3 py-1 text-xs rounded-md transition-colors"
            :class="rightPanel === 'assistant' ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'"
            @click="rightPanel = 'assistant'"
          >
            AI Assistant
          </button>
        </div>
        <CreateModelfilePreview v-if="rightPanel === 'preview'" :modelfile="currentModelfile" class="h-[28rem]" />
        <CreateAiAssistantPanel
          v-else
          :assistant="assistant"
          class="h-[28rem]"
          @apply="applyModelfile"
          @close="rightPanel = 'preview'"
        />
      </div>
    </div>

    <div class="mt-6 flex items-center gap-4">
      <button
        class="px-6 py-2.5 bg-accent text-black font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        :disabled="!modelName.trim() || !currentModelfile.trim() || isStreaming"
        @click="createModel"
      >
        Create Model
      </button>
      <span v-if="createStatus" class="text-sm text-text-secondary">{{ createStatus }}</span>
    </div>
  </div>
</template>
