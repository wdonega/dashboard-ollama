<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="px-4 py-3 rounded-lg text-sm shadow-lg max-w-sm"
        :class="{
          'bg-accent/20 border border-accent/40 text-accent': toast.type === 'success',
          'bg-danger/20 border border-danger/40 text-danger': toast.type === 'error',
          'bg-bg-tertiary border border-border text-text-primary': toast.type === 'info',
        }"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
