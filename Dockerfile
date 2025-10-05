# Build React frontend and serve with Express backend
FROM node:18

WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy and install frontend dependencies  
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy all source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build the React frontend for production
RUN cd frontend && npm run build

# Copy built frontend to backend public folder
RUN mkdir -p ./backend/public && cp -r ./frontend/build/* ./backend/public/

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the backend server
CMD ["node", "backend/server.js"]