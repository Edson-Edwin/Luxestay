# Use an official Node runtime as a parent image
FROM node:20-alpine AS builder

# Set work directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=256"
# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
