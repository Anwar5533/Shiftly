# ─── BASE ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
# Update OS packages and add libc6-compat for turbo and Prisma compatibility on alpine
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat
RUN corepack enable pnpm

# ─── STAGE 1 (Prune) ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
ARG APP_NAME
COPY . .
RUN turbo prune --scope=@shiftly/${APP_NAME} --docker
# Ensure prisma folder and config exist so COPY doesn't fail for apps without Prisma
RUN mkdir -p /app/out/full/apps/${APP_NAME}/prisma && touch /app/out/full/apps/${APP_NAME}/prisma.config.ts

# ─── STAGE 2 (Build) ──────────────────────────────────────────────────────────
FROM base AS installer
WORKDIR /app
ARG APP_NAME

# Install dependencies based on pruned lockfile
COPY --from=builder /app/out/json/ .

# Copy Prisma files so postinstall generation succeeds
COPY --from=builder /app/out/full/apps/${APP_NAME}/prisma ./apps/${APP_NAME}/prisma
COPY --from=builder /app/out/full/apps/${APP_NAME}/prisma.config.ts ./apps/${APP_NAME}/

ENV DATABASE_URL="postgresql://dummy"
RUN pnpm install

# Copy source code of pruned workspace
COPY --from=builder /app/out/full/ .

# Generate Prisma clients (this must happen before build)
RUN cd apps/${APP_NAME} && if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

# Build the target app and its dependencies
RUN pnpm turbo run build --filter=@shiftly/${APP_NAME}

# ─── STAGE 3 (Runner) ─────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ARG APP_NAME

ENV NODE_ENV=production

# Update OS packages and remove unused package managers and build tools from runner image
RUN apk update && apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn* /root/.npm /root/.pnpm-store

# Create a non-root user for security
RUN addgroup --system --gid 1001 nestjs \
    && adduser --system --uid 1001 nestjs
USER nestjs

# Copy the compiled application
COPY --from=installer --chown=nestjs:nestjs /app/apps/${APP_NAME}/dist ./dist

# Copy node_modules (including hoisted modules and the generated Prisma client)
COPY --from=installer --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nestjs /app/apps/${APP_NAME}/node_modules ./apps/${APP_NAME}/node_modules

# Ensure internal packages exist if symlinked
COPY --from=installer --chown=nestjs:nestjs /app/packages ./packages

# Copy prisma folder if present
COPY --from=installer --chown=nestjs:nestjs /app/apps/${APP_NAME}/prisma ./prisma

CMD ["node", "dist/main.js"]
