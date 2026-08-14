<script setup lang="ts">
const route = useRoute()
const { public: publicConfig } = useRuntimeConfig()

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/models', label: 'Models', icon: 'cube' },
  { path: '/playground', label: 'Playground', icon: 'chat' },
  { path: '/api-tester', label: 'API Tester', icon: 'terminal' },
]

const modelsStore = useModelsStore()

defineProps<{
  online: boolean
}>()

const mobileOpen = ref(false)

function isActive(item: { path: string }) {
  return route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path))
}
</script>

<template>
  <!-- Mobile hamburger -->
  <button
      class="fixed top-4 left-4 z-[60] md:hidden p-2.5 bg-bg-secondary border border-border rounded-xl cursor-pointer"
      @click="mobileOpen = !mobileOpen"
  >
    <span class="block w-5 h-0.5 bg-text-primary mb-1.5 transition-transform" :class="mobileOpen ? 'rotate-45 translate-y-2' : ''" />
    <span class="block w-5 h-0.5 bg-text-primary mb-1.5 transition-opacity" :class="mobileOpen ? 'opacity-0' : ''" />
    <span class="block w-5 h-0.5 bg-text-primary transition-transform" :class="mobileOpen ? '-rotate-45 -translate-y-2' : ''" />
  </button>

  <!-- Overlay for mobile -->
  <Transition name="fade">
    <div
        v-if="mobileOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        @click="mobileOpen = false"
    />
  </Transition>

  <aside
      class="fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border flex flex-col z-50 transition-transform duration-300 md:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <!-- Brand -->
    <div class="p-5 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-text-primary tracking-wide" style="font-family: var(--font-heading)">{{ publicConfig.appTitle }}</h1>
          <p class="text-xs text-text-secondary tracking-widest uppercase">Ollama Dashboard</p>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3 text-sm text-text-secondary">
        <span
            class="w-2 h-2 rounded-full shrink-0 transition-shadow duration-300"
            :class="online ? 'bg-success shadow-[0_0_8px_#22c55e]' : 'bg-danger'"
        />
        {{ online ? 'Connected' : 'Disconnected' }}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-3 space-y-1">
      <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
          :class="isActive(item)
          ? 'bg-accent/10 text-accent border-l-2 border-accent'
          : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'"
          @click="mobileOpen = false"
      >
        <!-- Dashboard icon -->
        <svg v-if="item.icon === 'dashboard'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- Cube icon -->
        <svg v-else-if="item.icon === 'cube'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- Chat icon -->
        <svg v-else-if="item.icon === 'chat'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- Terminal icon -->
        <svg v-else-if="item.icon === 'terminal'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="4 17 10 11 4 5" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="12" y1="19" x2="20" y2="19" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Active operations -->
    <div v-if="modelsStore.operationsInProgress.size > 0" class="p-3 border-t border-border">
      <h4 class="text-xs text-text-secondary px-2 mb-2 uppercase tracking-wider">Operations</h4>
      <div
          v-for="[name, op] in modelsStore.operationsInProgress"
          :key="name"
          class="px-2 py-2 text-xs"
      >
        <div class="flex justify-between text-text-secondary mb-1">
          <span class="truncate">{{ name }}</span>
          <span>{{ op.total > 0 ? Math.round((op.progress / op.total) * 100) + '%' : op.status }}</span>
        </div>
        <div class="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
              class="h-full bg-accent rounded-full transition-all duration-500"
              :style="{ width: op.total > 0 ? `${(op.progress / op.total) * 100}%` : '0%' }"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-border">
      <p class="text-xs text-text-secondary/60 text-center">Powered by Ollama</p>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>