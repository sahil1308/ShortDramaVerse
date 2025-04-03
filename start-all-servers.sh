#!/bin/sh
# Start all ShortDramaVerse servers in development mode

# Start main server in the background
echo "Starting main API server..."
node server-only.js > server.log 2>&1 &
MAIN_SERVER_PID=$!

# Give the server a moment to start
sleep 2

# Start client app in the background
echo "Starting client app server..."
node client-app.js > client.log 2>&1 &
CLIENT_SERVER_PID=$!

# Start the development server
echo "Starting ShortDramaVerse Development Server..."
node dev-server.cjs
DEV_SERVER_STATUS=$?

# When dev server exits, kill the other servers
echo "Shutting down all servers..."
kill $MAIN_SERVER_PID
kill $CLIENT_SERVER_PID

exit $DEV_SERVER_STATUS