#!/bin/bash

# Script to automatically sync the mobile application to its separate GitHub repository
echo "Starting mobile app sync..."

# Run the GitHub export script
cd script
node github-export-fixed.js

echo "Mobile app sync complete!"
