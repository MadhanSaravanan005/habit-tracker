#!/bin/bash
# Vercel / CI build script for faster deployment

echo "Starting optimized build..."

# Install only production dependencies and build frontend
cd frontend || exit 1
npm ci --only=production --silent

# Build the frontend
npm run build

echo "Build completed successfully!"
