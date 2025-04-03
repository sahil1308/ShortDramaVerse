#!/bin/sh
# Start the ShortDramaVerse client app

# Start the server in the background
node server-only.js > server.log 2>&1 &
SERVER_PID=$!

# Give the server a moment to start
sleep 2

# Start the client app
echo "Starting ShortDramaVerse Client App..."
node client-app.js

# When client exits, kill the server
kill $SERVER_PID