import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  modules: [
    '@pinia/nuxt',
    'nuxt-anime',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    ollamaHost: 'http://localhost:11434',
    // Central Prometheus that scrapes node_exporter across the homelab —
    // used to read RAM/GPU stats of whatever host runs Ollama, since the
    // dashboard container itself may run on a different machine.
    prometheusUrl: 'http://srv1.lab:9090',
    // instance label as it appears in Prometheus for the Ollama host's
    // node_exporter target, e.g. "llm1" (confirm via
    // /api/v1/label/instance/values on your Prometheus — this homelab
    // uses short hostnames, not host:port)
    prometheusInstance: '',
  },
})