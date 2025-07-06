# Dockerfile for a Next.js application

# 1. Builder Stage: Install dependencies and build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies using npm ci for faster, more reliable builds in CI/CD
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# 2. Runner Stage: Create a minimal production-ready image
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Create a non-root user and group for security best practices
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy the standalone output from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the static assets from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variables for the server
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js application
CMD ["node", "server.js"]
