#!/bin/bash

# Exit on error
set -e

echo "Building ShortDramaVerse application..."

# Build frontend
echo "Building frontend..."
npm run build

# Set NODE_ENV to production for the server
echo "Setting up production environment..."
export NODE_ENV=production

# Start the server in production mode
echo "Starting server in production mode..."
npm run start