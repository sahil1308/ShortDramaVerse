#!/bin/bash

# This script provides a unified interface to start the ShortDramaVerse application
# in various configurations to handle Replit's Vite host restrictions.

# Display header
echo "====================================================="
echo "   ShortDramaVerse - Development Launcher   "
echo "====================================================="
echo ""

# Function to display menu options
show_menu() {
  echo "Please select a startup mode:"
  echo ""
  echo "1) Full Stack Mode (API + VITE via Proxy)"
  echo "   - Starts the main server, API proxy, and Vite proxy"
  echo "   - Best for full development experience"
  echo ""
  echo "2) API Server Only"
  echo "   - Starts just the API server (backend)"
  echo "   - Use this for API testing or when running the frontend elsewhere"
  echo ""
  echo "3) Client App Only"
  echo "   - Starts a simplified HTML client that connects to the API"
  echo "   - Use this when Vite is having host restriction issues"
  echo ""
  echo "4) Development Server"
  echo "   - Starts the dev server with built-in API proxy and client"
  echo "   - Simplified development experience without Vite"
  echo ""
  echo "5) API Proxy"
  echo "   - Starts the API proxy server for testing API endpoints"
  echo "   - Use this for API testing with a user interface"
  echo ""
  echo "6) Exit"
  echo ""
  echo "====================================================="
}

# Function to handle user selection
handle_selection() {
  local selection=$1
  
  case $selection in
    1)
      echo "Starting Full Stack Mode..."
      ./start-servers.sh
      ;;
    2)
      echo "Starting API Server Only..."
      npx tsx server-only.js
      ;;
    3)
      echo "Starting Client App Only..."
      npx tsx client-app.js
      ;;
    4)
      echo "Starting Development Server..."
      npx tsx dev-server.js
      ;;
    5)
      echo "Starting API Proxy..."
      npx tsx proxy.js
      ;;
    6)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo "Invalid selection. Please try again."
      return 1
      ;;
  esac
  
  return 0
}

# Main loop
while true; do
  show_menu
  read -p "Enter your choice [1-6]: " choice
  echo ""
  
  if handle_selection $choice; then
    break
  fi
done