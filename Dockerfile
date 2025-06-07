
# Dockerfile for Next.js Application

# Stage 1: Build the application
# Use an official Node.js Alpine image as a base for smaller image size
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Install OS packages required for Next.js on Alpine
# libc6-compat is often needed for Node.js native modules
RUN apk add --no-cache libc6-compat

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package.json and package-lock.json (if available)
COPY package.json ./
# Use package-lock.json for reproducible installs
COPY package-lock.json* ./

# Install dependencies
# Using --frozen-lockfile ensures that npm doesn't update your lockfile during the build
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Stage 2: Production image
# Use a lean Node.js Alpine image for the production environment
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
# Set the port the app will run on.
# Next.js default is 3000 if PORT env var is not set.
ENV PORT 3000

# Install OS packages required for Next.js on Alpine (repeated for runner for safety, though often inherited or not needed if binaries are self-contained)
RUN apk add --no-cache libc6-compat

# Copy built assets from the builder stage
# Copy the 'public' folder
COPY --from=builder /app/public ./public
# Copy the '.next' folder which contains the build output
# For non-standalone output, this includes server components and static assets
COPY --from=builder /app/.next ./.next
# Copy node_modules (these are the production dependencies)
COPY --from=builder /app/node_modules ./node_modules
# Copy package.json (needed to run `npm start` which executes `next start`)
COPY --from=builder /app/package.json ./package.json

# Expose the port the app will run on
EXPOSE ${PORT}

# The command to start the Next.js application in production mode
# `npm start` will execute `next start` as defined in package.json
CMD ["npm", "start"]
