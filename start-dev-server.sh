#!/bin/sh
# Start the ShortDramaVerse development server

# Start the server in the background
node server-only.js > server.log 2>&1 &
SERVER_PID=$!

# Give the server a moment to start
sleep 2

# Start the development server
echo "Starting ShortDramaVerse Development Server..."
node dev-server.cjs

# When dev server exits, kill the server
kill $SERVER_PID