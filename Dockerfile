# Multi-stage build for React app
FROM node:18 as frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
# install all dependencies (including dev) so the frontend build can run
# react-scripts and other build tools may be devDependencies or require
# build toolchains not present in Alpine images
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy and install backend dependencies
COPY package*.json ./
RUN npm ci --only=production --silent

# Copy backend source
COPY backend/ ./backend/

# Copy the built frontend from the previous stage
COPY --from=frontend-build /app/frontend/build ./public

# Create .env file in production
RUN echo "NODE_ENV=production" > .env

EXPOSE 5000

CMD ["node", "backend/server.js"]