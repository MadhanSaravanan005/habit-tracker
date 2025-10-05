# Simple backend-only deployment for Railway
FROM node:18

WORKDIR /app

# Copy backend package files and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source code
COPY backend/ ./backend/

# Copy public folder for static files
COPY public/ ./public/

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the backend server
CMD ["node", "backend/server.js"]