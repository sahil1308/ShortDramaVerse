#!/bin/bash
# ShortDramaVerse - Script to start all servers
# This script is useful for development and testing

# Kill any existing processes using our ports
echo "Stopping any existing servers..."
lsof -ti:3000,8080,8888 | xargs kill -9 2>/dev/null || true

# Start the main server
echo "Starting main server on port 3000..."
node server-only.js &
MAIN_PID=$!

# Wait for the main server to start
sleep 2

# Start the dev server
echo "Starting dev server on port 8080..."
node dev-server.cjs &
DEV_PID=$!

# Start the client app server
echo "Starting client app server on port 8888..."
node client-app.js &
CLIENT_PID=$!

echo ""
echo "✓ All servers started successfully!"
echo ""
echo "Servers running:"
echo "- Main API server: http://localhost:3000"
echo "- Dev server: http://localhost:8080"
echo "- Client app: http://localhost:8888"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to kill all processes on exit
function cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $MAIN_PID $DEV_PID $CLIENT_PID 2>/dev/null || true
    exit 0
}

# Register the cleanup function for when script is interrupted
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait