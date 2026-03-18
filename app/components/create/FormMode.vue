<script setup lang="ts">
const modelsStore = useModelsStore()

const baseModel = ref('')
const systemPrompt = ref('')
const template = ref('')
const parameters = ref<Array<{ key: string; value: string }>>([])

const modelOptions = computed(() =>
  modelsStore.models.map(m => m.name)
)

function loadModelfile(content: string) {
  baseModel.value = ''
  systemPrompt.value = ''
  template.value = ''
  parameters.value = []

  const lines = content.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!.trim()

    if (line.toUpperCase().startsWith('FROM ')) {
      baseModel.value = line.slice(5).trim()
      i++
    } else if (line.toUpperCase().startsWith('SYSTEM ')) {
      systemPrompt.value = extractQuotedValue(lines, i, 'SYSTEM')
      i = skipBlock(lines, i)
    } else if (line.toUpperCase().startsWith('TEMPLATE ')) {
      template.value = extractQuotedValue(lines, i, 'TEMPLATE')
      i = skipBlock(lines, i)
    } else if (line.toUpperCase().startsWith('PARAMETER ')) {
      const parts = line.slice(10).trim().split(/\s+/, 2)
      if (parts.length === 2) {
        parameters.value.push({ key: parts[0]!, value: parts[1]! })
      }
      i++
    } else {
      i++
    }
  }
}

function extractQuotedValue(lines: string[], startIdx: number, directive: string): string {
  const firstLine = lines[startIdx]!.trim().slice(directive.length).trim()
  // Triple-quoted block: """..."""
  if (firstLine.startsWith('"""')) {
    const content = firstLine.slice(3)
    if (content.endsWith('"""')) return content.slice(0, -3)
    // Multi-line triple-quoted
    const collected = [content]
    for (let j = startIdx + 1; j < lines.length; j++) {
      const l = lines[j]!
      if (l.trimEnd().endsWith('"""')) {
        collected.push(l.trimEnd().slice(0, -3))
        break
      }
      collected.push(l)
    }
    return collected.join('\n')
  }
  // Single-quoted or bare value
  if (firstLine.startsWith('"') && firstLine.endsWith('"')) return firstLine.slice(1, -1)
  return firstLine
}

function skipBlock(lines: string[], startIdx: number): number {
  const firstLine = lines[startIdx]!.trim()
  const directive = firstLine.split(/\s/)[0]!
  const afterDirective = firstLine.slice(directive.length).trim()
  if (afterDirective.startsWith('"""') && !afterDirective.slice(3).includes('"""')) {
    for (let j = startIdx + 1; j < lines.length; j++) {
      if (lines[j]!.trimEnd().endsWith('"""')) return j + 1
    }
  }
  return startIdx + 1
}

function addParameter() {
  parameters.value.push({ key: '', value: '' })
}

function removeParameter(index: number) {
  parameters.value.splice(index, 1)
}

const modelfile = computed(() => {
  const lines: string[] = []
  if (baseModel.value) lines.push(`FROM ${baseModel.value}`)
  if (systemPrompt.value) lines.push(`SYSTEM """${systemPrompt.value}"""`)
  if (template.value) lines.push(`TEMPLATE """${template.value}"""`)
  for (const param of parameters.value) {
    if (param.key && param.value) {
      lines.push(`PARAMETER ${param.key} ${param.value}`)
    }
  }
  return lines.join('\n')
})

defineExpose({ modelfile, loadModelfile })
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-text-secondary mb-1">Base Model</label>
      <select
        v-model="baseModel"
        class="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="">Select a model...</option>
        <option v-for="name in modelOptions" :key="name" :value="name">{{ name }}</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-text-secondary mb-1">System Prompt</label>
      <textarea
        v-model="systemPrompt"
        rows="4"
        class="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-y"
        placeholder="You are a helpful assistant..."
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-text-secondary mb-1">Template (optional)</label>
      <textarea
        v-model="template"
        rows="3"
        class="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent resize-y"
        placeholder="{{ .System }} {{ .Prompt }}"
      />
    </div>
    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="text-sm font-medium text-text-secondary">Parameters</label>
        <button class="text-xs text-accent hover:text-accent-hover" @click="addParameter">
          + Add parameter
        </button>
      </div>
      <div class="space-y-2">
        <div v-for="(param, i) in parameters" :key="i" class="flex gap-2">
          <input v-model="param.key" placeholder="temperature"
            class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent" />
          <input v-model="param.value" placeholder="0.7"
            class="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent" />
          <button class="px-2 text-danger hover:text-danger/80" @click="removeParameter(i)">&times;</button>
        </div>
      </div>
    </div>
  </div>
</template>
