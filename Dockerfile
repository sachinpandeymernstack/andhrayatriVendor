# ==============================================================================
# AndhraYatri Vendor Partner Portal - Multi-Stage Production Dockerfile
# Stage 1: Build the Vite + React TypeScript SPA
# ==============================================================================
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=4096"

ARG VITE_API_ORIGIN=https://api.andhrayatri.com
ARG VITE_API_BASE_URL=https://api.andhrayatri.com/api/v1
ARG VITE_GOOGLE_MAPS_API_KEY=AIzaSyAJuqCQT3_uInZBGaSm0fu5pFEETjoYKNU
ARG VITE_MAIN_SITE_URL=https://andhrayatri.com

ENV VITE_API_ORIGIN=${VITE_API_ORIGIN}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
ENV VITE_MAIN_SITE_URL=${VITE_MAIN_SITE_URL}

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

RUN npm run build

# ==============================================================================
# Stage 2: Serve Production Assets with Lightweight, Hardened Nginx
# ==============================================================================
FROM docker.io/library/nginx:1.25-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache curl

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

