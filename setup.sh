#!/bin/bash
# ShortDramaVerse Setup Script
# This script installs dependencies and sets up the environment

echo "Setting up ShortDramaVerse..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "Error: Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Make shell scripts executable
chmod +x *.sh

echo "Setup complete! You can now run the application using:"
echo ""
echo "  npm run dev      # Standard development mode"
echo "  ./start-all-servers.sh  # Custom server configuration"
echo ""
echo "See SETUP.md for more detailed instructions."