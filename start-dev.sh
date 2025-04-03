#!/bin/bash

# Start the main server
echo "Starting main server..."
# First check if the main server is already running
if lsof -i :3000 > /dev/null 2>&1; then
  echo "Main server already running on port 3000"
else
  npm run dev &
  echo "Waiting for main server to start..."
  sleep 3
fi

# Start the dev server
echo "Starting development server..."
npx tsx dev-server.js