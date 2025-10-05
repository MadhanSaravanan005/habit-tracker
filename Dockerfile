# Development React + Backend for Railway
FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend package files and install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy all source code
COPY . .

# Set environment variables for React dev server
ENV BROWSER=none
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=/api

# Expose port 5000 (backend will proxy to React on 3000)
EXPOSE 5000

# Start both services using the package.json start script
CMD ["npm", "start"]