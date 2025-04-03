#!/bin/bash

# ShortDramaVerse starter script
# This script helps you start the application in different modes

set -e

# Default mode is standard (Vite)
MODE=${1:-standard}

# Kill any running servers
function kill_servers() {
  echo "Stopping any running servers..."
  pkill -f "node dev-server.cjs" || true
  pkill -f "node client-app.js" || true
  pkill -f "tsx server/index.ts" || true
  pkill -f "node server-only.js" || true
  sleep 1
}

# Display help
function show_help() {
  echo "ShortDramaVerse Starter Script"
  echo "------------------------------"
  echo "Usage: ./start.sh [mode]"
  echo ""
  echo "Available modes:"
  echo "  standard   - Start with Vite development server (default)"
  echo "  dev        - Start custom development server on port 8080"
  echo "  client     - Start standalone client server on port 8888"
  echo "  server     - Start API server only on port 3000"
  echo "  all        - Start all servers (API, dev, and client)"
  echo "  help       - Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./start.sh             # Start in standard mode"
  echo "  ./start.sh dev         # Start in dev mode"
  echo "  ./start.sh all         # Start all servers"
}

# Check if we should show help
if [ "$MODE" == "help" ]; then
  show_help
  exit 0
fi

# Kill any running servers before starting
kill_servers

# Start the application in the specified mode
case "$MODE" in
  standard)
    echo "Starting application in standard mode (Vite)..."
    echo "Access at: http://localhost:3000"
    npm run dev
    ;;
  dev)
    echo "Starting custom development server..."
    echo "Access at: http://localhost:8080"
    node dev-server.cjs
    ;;
  client)
    echo "Starting standalone client server..."
    echo "Access at: http://localhost:8888"
    node client-app.js
    ;;
  server)
    echo "Starting API server only..."
    echo "Server running at: http://localhost:3000"
    node server-only.js
    ;;
  all)
    echo "Starting all servers..."
    echo "API server:      http://localhost:3000"
    echo "Dev server:      http://localhost:8080"
    echo "Client server:   http://localhost:8888"
    ./start-all-servers.sh
    ;;
  *)
    echo "Unknown mode: $MODE"
    show_help
    exit 1
    ;;
esac