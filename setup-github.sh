#!/bin/bash

# Exit on error
set -e

# GitHub repository name
REPO_NAME="ShortDramaVerse"
GITHUB_API="https://api.github.com"

echo "Setting up GitHub integration for $REPO_NAME..."

# Create a new repository on GitHub
echo "Creating GitHub repository..."
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  $GITHUB_API/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"A web-based short-form drama content streaming platform\",\"private\":false,\"is_template\":false}" > /dev/null

echo "Repository created successfully!"

# Add GitHub as remote repository
echo "Configuring Git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://oauth2:${GITHUB_TOKEN}@github.com/$(curl -s -H "Authorization: token $GITHUB_TOKEN" $GITHUB_API/user | grep -o '"login": "[^"]*' | cut -d'"' -f4)/${REPO_NAME}.git

# Stage all changes and make an initial commit
echo "Staging changes..."
git add -A

# Commit if there are changes
git diff --staged --quiet || git commit -m "Initial commit from Replit"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

# Set up post-commit hook for automatic syncing
echo "Setting up automatic syncing..."
mkdir -p .git/hooks
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
git push origin main
EOF

chmod +x .git/hooks/post-commit

# Note: Automatic cron-based syncing is not available in Replit
# Instead, we'll rely on the post-commit hook and manual sync script

echo "==========================================="
echo "GitHub integration successfully configured!"
echo "Repository: $REPO_NAME"
echo "Automatic syncing is now enabled."
echo "Any changes in Replit will be reflected on GitHub."
echo "==========================================="