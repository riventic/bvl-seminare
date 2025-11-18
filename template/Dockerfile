# ============================================================================
# Build Stage - Optimized for throughput and caching
# ============================================================================
FROM node:20-alpine AS builder

LABEL maintainer="Riventic GmbH"
LABEL description="Frontend build stage for Nexus application"

# Create non-root user for build process (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Accept build-time arguments for environment configuration
# This allows overriding the API URL at build time via docker-compose or docker build
ARG VITE_API_URL=http://localhost:8000

# Convert ARG to ENV so Vite can access them during build
ENV VITE_API_URL=$VITE_API_URL

# Install build dependencies for better performance
RUN apk add --no-cache python3 make g++

# Switch to non-root user
USER nodejs

# Copy only package files first for better layer caching
# This layer is cached unless dependencies change
COPY --chown=nodejs:nodejs package.json package-lock.json* ./

# Install dependencies with optimizations
# Use npm ci for deterministic installs (respects package-lock.json exactly)
RUN npm ci --prefer-offline --no-fund

# Copy source code (separate layer for better caching)
COPY --chown=nodejs:nodejs . .

# Build with optimizations
# Increase Node.js memory limit for faster builds
# Enable parallel processing
ENV NODE_OPTIONS="--max-old-space-size=4096"
#RUN npm run build
RUN bash build-all.sh


# Pre-compress static assets for better runtime performance
# Note: gzip is already included in Alpine base image
# Note: Brotli disabled due to nginx module version mismatch - uncomment when resolved
# RUN apk add --no-cache brotli

# Compress all static assets
# Nginx will serve .gz versions automatically via gzip_static
RUN find dist -type f \( \
    -name '*.js' -o \
    -name '*.css' -o \
    -name '*.html' -o \
    -name '*.json' -o \
    -name '*.svg' -o \
    -name '*.txt' -o \
    -name '*.xml' \
    \) -exec sh -c ' \
    echo "Compressing: $1"; \
    gzip -9 -k "$1"; \
    ' sh {} \;

# Brotli pre-compression (commented out - uncomment when nginx module version matches)
# RUN find dist -type f \( \
#     -name '*.js' -o \
#     -name '*.css' -o \
#     -name '*.html' -o \
#     -name '*.json' -o \
#     -name '*.svg' -o \
#     -name '*.txt' -o \
#     -name '*.xml' \
#     \) -exec sh -c ' \
#     echo "Brotli compressing: $1"; \
#     brotli -q 11 -o "$1.br" "$1"; \
#     ' sh {} \;

# ============================================================================
# Production Stage - Optimized Nginx
# ============================================================================
FROM nginx:alpine

# Install brotli module for nginx (commented out - version mismatch with current nginx)
# Uncomment when Alpine's nginx-mod-http-brotli matches nginx version
# RUN apk add --no-cache nginx-mod-http-brotli

# Create nginx user with specific UID/GID for consistency
RUN addgroup -g 101 -S nginx || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Copy pre-compressed assets from builder
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy optimized nginx configuration (replace main config)
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Create necessary directories with correct permissions for non-root nginx
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx /var/run/nginx && \
    # Allow nginx to bind to port 80 (normally requires root)
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expose HTTP port (non-privileged port)
EXPOSE 80

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Switch to non-root user
USER nginx

# Use exec form for proper signal handling (allows graceful shutdown)
CMD ["nginx", "-g", "daemon off;"]
