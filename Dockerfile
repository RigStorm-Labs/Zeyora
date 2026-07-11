# ============================================
# ZEYORA - Multi-stage Production Dockerfile
# ============================================

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Stage 2: Dependencies
FROM base AS deps
COPY package*.json ./
COPY packages/*/package*.json ./packages/
COPY apps/*/package*.json ./apps/
RUN npm ci --workspaces --if-present

# Stage 3: Build
FROM deps AS builder
COPY . .
RUN npm run build --workspaces --if-present

# Stage 4: Production API
FROM base AS production-api
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist ./dist
COPY packages/api/package*.json ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node
ENTRYPOINT ["dumb-init", "node", "dist/index.js"]

# Stage 5: Production Web Apps
FROM nginx:alpine AS production-web
COPY --from=builder /app/apps/*/dist /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
