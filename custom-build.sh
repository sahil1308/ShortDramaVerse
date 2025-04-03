#!/bin/bash

# Exit on error
set -e

# Create production build directory
mkdir -p dist/client

# Build client-side code with Vite 
echo "Building frontend with Vite..."
npx vite build --outDir=dist/client

# Build server-side code with esbuild
echo "Building server with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Update server path references for production
echo "Configuring server for production..."
NODE_ENV=production

echo "Build completed successfully!"