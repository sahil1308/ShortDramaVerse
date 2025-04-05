#!/bin/bash

# Script to synchronize the ShortDramaVerse Mobile application to sahil1308/short-drama-verse-mobile repository
echo "Starting synchronization to sahil1308/short-drama-verse-mobile..."

# Check GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GitHub token not found. Please set the GITHUB_TOKEN environment variable."
  echo "You can create a personal access token at https://github.com/settings/tokens"
  exit 1
fi

# Check GitHub access
echo "Verifying GitHub repository access..."
node script/check-github-access.js
if [ $? -ne 0 ]; then
  echo "GitHub repository access verification failed. Aborting sync."
  exit 1
fi

# Run the GitHub export script
echo "Running GitHub export script..."
cd script
node github-export-fixed.js
if [ $? -ne 0 ]; then
  echo "GitHub export failed. Please check the error messages above."
  exit 1
fi

echo "Synchronization to sahil1308/short-drama-verse-mobile completed successfully!"
echo "Repository URL: https://github.com/sahil1308/short-drama-verse-mobile"
