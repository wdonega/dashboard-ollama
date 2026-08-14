# Stage 1: Install dependencies
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the Nuxt application
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
#COPY --from=build /app/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_OLLAMA_HOST=http://localhost:11434

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
