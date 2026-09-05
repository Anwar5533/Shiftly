# ─── BASE ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

# ─── STAGE 1 (Prune) ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@shiftly/web --docker

# ─── STAGE 2 (Build) ──────────────────────────────────────────────────────────
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@shiftly/web

# ─── STAGE 3 (Runner) ─────────────────────────────────────────────────────────
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built static files from installer
COPY --from=installer /app/apps/web/dist .

# Add NGINX configuration for SPA routing
RUN cat <<EOF > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
