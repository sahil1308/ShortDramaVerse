#!/bin/bash

# Function to handle cleanup
cleanup() {
  echo "Stopping all servers..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}

# Set up trap for SIGINT (Ctrl+C) to perform cleanup
trap cleanup SIGINT

# Display header
echo "====================================================="
echo "   ShortDramaVerse - Starting All Services   "
echo "====================================================="
echo ""

# Start the main API server (Express)
echo "Starting API server on port 3000..."
npx tsx server-only.js &
API_SERVER_PID=$!
echo "API server started with PID: $API_SERVER_PID"
echo ""

# Wait a moment for the API server to initialize
sleep 1

# Start the API Proxy server
echo "Starting API Proxy server on port 3333..."
npx tsx proxy.js &
PROXY_SERVER_PID=$!
echo "API Proxy server started with PID: $PROXY_SERVER_PID"
echo ""

# Start the development server
echo "Starting development server on port 8080..."
npx tsx dev-server.js &
DEV_SERVER_PID=$!
echo "Development server started with PID: $DEV_SERVER_PID"
echo ""

# Start the client app server
echo "Starting client app server on port 8888..."
npx tsx client-app.js &
CLIENT_APP_PID=$!
echo "Client app server started with PID: $CLIENT_APP_PID"
echo ""

# Display service information
echo "====================================================="
echo "Services are now running:"
echo "- API Server:        http://localhost:3000"
echo "- API Proxy:         http://localhost:3333"
echo "- Development Server: http://localhost:8080"
echo "- Client App:        http://localhost:8888"
echo "====================================================="
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep the script running
wait