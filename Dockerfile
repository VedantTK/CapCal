# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If you are using yarn, uncomment the next line and comment out the npm ci line
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set environment variables for build time (if any)
# ENV NEXT_PUBLIC_SOME_VARIABLE=your_value

# Build the application
RUN npm run build

# Ensure the public directory exists in the builder stage
# This prevents an error if the public folder is missing during the COPY operation.
RUN mkdir -p /app/public


# Stage 2: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user and group
# Using 'node' as user and group name to be more standard with node images
RUN addgroup -S node && adduser -S node -G node

# Set environment variables
ENV NODE_ENV=production
# ENV PORT=3000 # Next.js default is 3000, uncomment if you need to change

# Copy built assets from the builder stage

# Copy the 'public' folder
COPY --from=builder --chown=node:node /app/public ./public
# Copy the '.next' folder which contains the build output
COPY --from=builder --chown=node:node /app/.next ./.next

# Copy node_modules
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy package.json
COPY --from=builder --chown=node:node /app/package.json ./package.json

# If your Next.js app uses a custom server.js, copy it as well
# COPY --from=builder --chown=node:node /app/server.js ./server.js

# Switch to the non-root user
USER node

# Expose the port the app runs on
EXPOSE 3000

# Start the application
# The default command for Next.js is `next start`
CMD ["npm", "start"]
