# syntax=docker/dockerfile:1

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

# Enable pnpm via corepack (version pinned in package.json)
RUN corepack enable

# Install deps first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build SSR app
COPY . .
RUN pnpm build

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy only the built output (browser + server bundles)
COPY --from=build /app/dist/tesla-landing-page ./dist/tesla-landing-page

EXPOSE 4000

# Run as non-root
USER node

CMD ["node", "dist/tesla-landing-page/server/server.mjs"]
