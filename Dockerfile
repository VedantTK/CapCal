# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
# Using npm ci for cleaner installs if package-lock.json is present
# Fallback to npm install if package-lock.json is not available
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the application code
COPY . .

# Ensure the public directory exists in the builder stage, even if it's not in the source
# This prevents the COPY command in the runner stage from failing if /public is not in the project root.
RUN mkdir -p /app/public

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# The Next.js app runs on port 3000 by default, but this can be changed.
EXPOSE 3000

# Copy built assets from the builder stage with correct ownership for the 'node' user
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
# If you have a next.config.js or other root config files needed at runtime, copy them too:
# COPY --from=builder --chown=node:node /app/next.config.js ./next.config.js

# Set the user to 'node' for better security *after* files are copied and owned correctly
USER node

# The command to run the Next.js application
# 'npm start' will execute the 'next start' script defined in package.json
CMD ["npm", "start"]
