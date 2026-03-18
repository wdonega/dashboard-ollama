<script setup lang="ts">
const chatStore = useChatStore()
</script>

<template>
  <div class="w-64 border-l border-border p-4 space-y-4 overflow-y-auto">
    <h3 class="text-sm font-medium text-text-secondary">Options</h3>
    <div>
      <label class="block text-xs text-text-secondary mb-1">
        Temperature: {{ chatStore.options.temperature }}
      </label>
      <input
        v-model.number="chatStore.options.temperature"
        type="range"
        min="0"
        max="2"
        step="0.1"
        class="w-full accent-accent"
      />
    </div>
    <div>
      <label class="block text-xs text-text-secondary mb-1">
        Top P: {{ chatStore.options.top_p }}
      </label>
      <input
        v-model.number="chatStore.options.top_p"
        type="range"
        min="0"
        max="1"
        step="0.05"
        class="w-full accent-accent"
      />
    </div>
    <div>
      <label class="block text-xs text-text-secondary mb-1">Max Tokens (-1 = unlimited)</label>
      <input
        v-model.number="chatStore.options.num_predict"
        type="number"
        min="-1"
        class="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
      />
    </div>
    <div>
      <label class="block text-xs text-text-secondary mb-1">System Prompt</label>
      <textarea
        v-model="chatStore.options.system"
        rows="4"
        class="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-y"
        placeholder="Optional system prompt..."
      />
    </div>
  </div>
</template>
