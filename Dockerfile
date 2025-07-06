# Stage 1: Install dependencies
# We use node:20-slim as it's smaller than the full node image.
FROM node:20-slim AS deps
WORKDIR /app

# Copy package.json and install dependencies. This layer is cached
# unless package.json changes.
COPY package.json ./
RUN npm install

# Stage 2: Build the application
FROM node:20-slim AS builder
WORKDIR /app
# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Run the build script which will leverage the "output: 'standalone'"
# in next.config.ts
RUN npm run build

# Stage 3: Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user and group for security reasons.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage.
COPY --from=builder --chown=nextjs:nodejs ./.next/standalone ./
# Copy the public folder from the builder stage.
COPY --from=builder --chown=nextjs:nodejs ./public ./public
# Copy the static assets from the builder stage.
COPY --from=builder --chown=nextjs:nodejs ./.next/static ./.next/static

# Set the user to the non-root user
USER nextjs

EXPOSE 3000

# Set the port environment variable
ENV PORT 3000

# The default command to start the Next.js application in standalone mode
CMD ["node", "server.js"]
