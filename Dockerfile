# Multi-stage Docker build for the coin_market_cap service.
#
# 1. deps      – full npm install (includes dev deps: tsc)
# 2. build     – compile TypeScript to ./dist
# 3. prod-deps – production-only npm install (native sqlite3 binary)
# 4. runtime   – minimal image: dist + prod node_modules, non-root user

FROM node:24-slim AS deps
# Build toolchain so native modules (sqlite3) can compile if no prebuilt
# binary is available for the platform.
RUN apt-get update && apt-get install -y --no-install-recommends \
        make g++ python3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY app ./app
RUN npm run build

FROM node:24-slim AS prod-deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        make g++ python3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
# sqlite3's install script downloads a prebuilt N-API binary that is linked
# against a newer glibc than this base image (Debian bookworm, glibc 2.36),
# so rebuild it from source against the local toolchain.
RUN npm ci --omit=dev \
    && npm install --no-save node-gyp \
    && cd node_modules/sqlite3 && npx node-gyp rebuild

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    APP_PORT=3000
# package.json is needed at runtime: it declares "type": "module" and the
# "#app/*" -> "./dist/*" package import mappings used by the compiled code.
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN chown -R node:node /app
USER node
EXPOSE 3000
# The sqlite database is opened relative to the working directory
# (./database.sqlite); mount a volume at /app to persist it.
VOLUME /app
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('net').connect(process.env.APP_PORT ?? 3000,'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"
CMD ["node", "dist/index.js"]
