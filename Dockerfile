# Dockerfile for a production Next.js app

# ---- Base ----
# Use a specific version of Node.js for reproducibility.
# Alpine versions are smaller and good for production.
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
# Install dependencies in a separate stage to leverage Docker's layer caching.
# This layer is only rebuilt when package.json or package-lock.json changes.
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Builder ----
# Build the application. This stage uses the installed dependencies.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables if any are needed
# ENV NEXT_PUBLIC_API_URL=https://api.example.com

RUN npm run build

# ---- Runner ----
# The final, small production image.
# It uses the same Node.js Alpine base for consistency.
FROM base AS runner
WORKDIR /app

# The node:20-alpine image already includes a non-root 'node' user.
# We'll use this user to run our application for better security.
USER node

# Copy the essential build output from the builder stage.
# The 'standalone' output mode bundles only the necessary files.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Expose the port the app will run on.
EXPOSE 3000

# Set the PORT environment variable.
ENV PORT 3000
# Recommended for production to disable hostname checking
ENV NODE_HOSTNAME 0.0.0.0

# Start the Node.js server.
# The standalone output creates a 'server.js' file for this purpose.
CMD ["node", "server.js"]
