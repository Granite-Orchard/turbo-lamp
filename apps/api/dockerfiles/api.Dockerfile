# =============================================================================
# Base
# =============================================================================
FROM node:24-alpine3.23 AS base

# =============================================================================
# Stage 1: Prune – generate a minimal subset of the monorepo for the API
# NOTE: "api" must match the "name" field in apps/api/package.json
# Build from monorepo root: docker build -f apps/api/dockerfiles/api.Dockerfile .
# =============================================================================
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@2.9.3
COPY . .
RUN turbo prune api --docker

# =============================================================================
# Stage 2: Install ALL dependencies (dev + prod) needed for the build
# Splitting json-only copy from full source copy maximises layer cache hits
# =============================================================================
FROM base AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci --legacy-peer-deps

# =============================================================================
# Stage 3: Build the API
# Copy the full /app dir from deps (captures root AND workspace node_modules),
# then overlay the real source so nothing is missing for tsc
# =============================================================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=api

# =============================================================================
# Stage 4: Runtime – lean production image with prod-only deps
# =============================================================================
FROM node:24-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache wget=1.25.0-r2 \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup

# Re-install prod-only deps from the pruned lockfile (no devDeps)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

USER appuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/core/v1/health || exit 1
CMD ["node", "apps/api/dist/main"]
