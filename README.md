# Ollama Dashboard

A modern web dashboard for interacting with [Ollama](https://ollama.com), your local LLM runtime. Built with Nuxt 4, Vue 3, and Tailwind CSS.

## Features

- **Model Management** — Browse, inspect, and create custom models
- **Playground** — Chat with your models in a conversational interface
- **API Tester** — Visual request builder to explore the Ollama API
- **Docker Ready** — Run in dev or production with Docker Compose

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Ollama](https://ollama.com) running locally or on a remote host

## Installation

### npm

```bash
git clone https://github.com/jemagne/Dashboard-Ollama.git
cd Dashboard-Ollama
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Docker

```bash
docker compose -f docker-compose.dev.yml up
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

```env
# Ollama API URL (default: http://localhost:11434)
NUXT_OLLAMA_HOST=http://localhost:11434
```

## Build for Production

```bash
npm run build
npm run preview
```

## License

[MIT](LICENSE)
