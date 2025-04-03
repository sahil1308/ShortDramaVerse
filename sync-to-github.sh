#!/bin/bash

# Exit on error
set -e

echo "Syncing changes to GitHub..."

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# Add all changes
git add -A

# Commit if there are changes
if git diff --staged --quiet; then
  echo "No changes to sync."
else
  git commit -m "Auto-sync from Replit $(date)"
  # Post-commit hook will handle the push
  echo "Changes committed and pushed to GitHub."
fi

echo "Sync complete!"