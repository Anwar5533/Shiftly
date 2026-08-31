# ─── BASE ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
# Add libc6-compat for turbo and Prisma compatibility on alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

# ─── STAGE 1 (Prune) ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
ARG APP_NAME
COPY . .
RUN turbo prune --scope=@shiftly/${APP_NAME} --docker

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
RUN cd apps/${APP_NAME} && npx prisma generate

# Build the target app and its dependencies
RUN pnpm turbo run build --filter=@shiftly/${APP_NAME}

# ─── STAGE 3 (Runner) ─────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ARG APP_NAME

ENV NODE_ENV=production

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

# Copy prisma folder for migrations
COPY --from=installer --chown=nestjs:nestjs /app/apps/${APP_NAME}/prisma ./prisma

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
