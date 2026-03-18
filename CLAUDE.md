# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ollama Dashboard — a Nuxt 4 web application for interacting with Ollama (local LLM runtime). Uses Vue 3, Pinia for state management, and nuxt-anime for animations.

## Commands

- **Dev server:** `npm run dev` (serves on http://localhost:3000)
- **Build:** `npm run build`
- **Preview production build:** `npm run preview`
- **Generate static site:** `npm run generate`
- **Prepare (post-install):** `npm run postinstall` (runs `nuxt prepare`)

## Architecture

- **Framework:** Nuxt 4 with `compatibilityDate: '2025-07-15'`
- **State management:** Pinia (`@pinia/nuxt`)
- **Animations:** `nuxt-anime`
- **Entry point:** `app/app.vue`
- Nuxt auto-imports components, composables, and utils from conventional directories (`app/components/`, `app/composables/`, `app/pages/`, `app/layouts/`, `server/`, etc.)
- TypeScript config references generated types in `.nuxt/`
