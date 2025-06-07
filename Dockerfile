# Dockerfile for Next.js Application

# ---- Builder Stage ----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Using npm ci for cleaner installs in CI/CD environments
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set build-time environment variables if needed
# ENV NEXT_PUBLIC_API_URL=https://api.example.com

# Build the Next.js application
# This will also run 'next lint' and 'tsc --noEmit' if they are part of the build script
RUN npm run build

# Ensure /app/public directory exists, even if empty
# This prevents errors if 'public' folder is not present in the project root
RUN mkdir -p /app/public


# ---- Runner Stage (Production) ----
FROM node:20-alpine AS runner

WORKDIR /app

# The node:alpine images come with a non-root 'node' user.
# We don't need to create it again.

# Set environment variables
ENV NODE_ENV=production
# Specify the port Next.js will run on. Default is 3000.
# ENV PORT=3000 # This can be set at runtime too

# Copy built assets from the builder stage

# Copy the 'public' folder
COPY --from=builder --chown=node:node /app/public ./public

# Copy the '.next' folder which contains the build output
# For non-standalone output, this includes server components and static assets
COPY --from=builder --chown=node:node /app/.next ./.next

# Copy Next.js configuration files
COPY --from=builder --chown=node:node /app/next.config.ts ./
COPY --from=builder --chown=node:node /app/package.json ./

# If you are using the Next.js App Router with server components,
# and not using the 'standalone' output mode, you might also need to copy node_modules
# if your server components rely on them directly at runtime.
# However, with 'npm ci' in the builder and if dependencies are bundled correctly,
# this might not be strictly necessary. For safety, if using server components extensively:
# COPY --from=builder --chown=node:node /app/node_modules ./node_modules


# Set the user to the non-root user 'node'
USER node

# Expose the port the app runs on
EXPOSE 3000
# If you changed ENV PORT above, change it here too
# EXPOSE $PORT

# Command to run the Next.js application
# The default Next.js start script is 'next start'
CMD ["npm", "start"]
