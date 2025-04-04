#!/usr/bin/env node

/**
 * GitHub Repository Export Script
 * 
 * This script exports the ShortDramaVerse Mobile application to a new GitHub repository.
 * It creates a new repository if one doesn't exist, or updates an existing one.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Simple prompt function for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = 'short-drama-verse-mobile';
const REPO_DESCRIPTION = 'ShortDramaVerse Mobile - A React Native mobile application for iOS and Android';
const SOURCE_DIR = path.join(__dirname, '../short-drama-verse-mobile');
const TEMP_DIR = path.join(__dirname, '../temp-mobile-export');

// Check if GitHub token is available
if (!GITHUB_TOKEN) {
  console.error('ERROR: GitHub token not found. Please set the GITHUB_TOKEN environment variable.');
  console.error('You can create a personal access token at https://github.com/settings/tokens');
  process.exit(1);
}

// Check if source directory exists
if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`ERROR: Source directory not found: ${SOURCE_DIR}`);
  process.exit(1);
}

// Create a temporary directory for the export
if (fs.existsSync(TEMP_DIR)) {
  console.log('Cleaning up existing temporary directory...');
  execSync(`rm -rf "${TEMP_DIR}"`);
}
fs.mkdirSync(TEMP_DIR, { recursive: true });

/**
 * Get GitHub username using the GitHub API
 */
async function getGitHubUsername() {
  try {
    const result = execSync(`curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/user`, { encoding: 'utf8' });
    const userData = JSON.parse(result);
    return userData.login;
  } catch (error) {
    console.error('Error fetching GitHub username:', error);
    return await prompt('Enter your GitHub username: ');
  }
}

async function main() {
  try {
    console.log(`Exporting ShortDramaVerse Mobile from ${SOURCE_DIR} to GitHub...`);
    
    // Copy files to the temporary directory
    console.log('Copying files to temporary directory...');
    execSync(`cp -r "${SOURCE_DIR}/." "${TEMP_DIR}"`);
    
    // Initialize git repository in the temporary directory
    console.log('Initializing Git repository...');
    execSync(`cd "${TEMP_DIR}" && git init`);
    
    // Get GitHub username
    const githubUsername = await getGitHubUsername();
    console.log(`Using GitHub username: ${githubUsername}`);

    // Always create/recreate GitHub repository
    console.log('Creating or updating GitHub repository...');
    
    try {
      // Delete repository if it exists
      try {
        execSync(`curl -s -X DELETE -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/${githubUsername}/${REPO_NAME}`, 
          { stdio: 'pipe' });
        console.log(`Deleted existing GitHub repository ${REPO_NAME}.`);
        // Wait a bit to let GitHub process the deletion
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(`Repository ${REPO_NAME} does not exist yet or could not be deleted.`);
      }
      
      // Create new repository
      console.log(`Creating GitHub repository ${REPO_NAME}...`);
      execSync(`curl -s -X POST -H "Authorization: token ${GITHUB_TOKEN}" \
        -d '{"name":"${REPO_NAME}", "description":"${REPO_DESCRIPTION}", "private":false, "auto_init":false}' \
        https://api.github.com/user/repos`, 
        { stdio: 'inherit' });
      
      console.log(`GitHub repository ${REPO_NAME} created successfully.`);
      // Wait a bit to let GitHub fully initialize the repository
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error creating GitHub repository:', error);
      process.exit(1);
    }
    
    // Create README.md if it doesn't exist
    if (!fs.existsSync(path.join(TEMP_DIR, 'README.md'))) {
      console.log('Creating README.md...');
      fs.writeFileSync(
        path.join(TEMP_DIR, 'README.md'),
        `# ShortDramaVerse Mobile

A comprehensive React Native mobile application for iOS and Android that provides a premium short-form drama streaming experience.

## Features

- User authentication and profile management
- Content discovery and recommendations
- Video streaming with playback controls
- Offline viewing capabilities
- Watchlist and viewing history
- In-app purchases and subscriptions
- Push notifications
- Analytics and reporting

## Technology Stack

- React Native for cross-platform mobile development
- TypeScript for type safety
- React Navigation for navigation
- AsyncStorage for local data persistence
- Axios for API communication
- React Query for data fetching
- Expo Vector Icons for iconography

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/${githubUsername}/${REPO_NAME}.git
   cd ${REPO_NAME}
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   # or
   yarn install
   \`\`\`

3. Start the development server:
   \`\`\`
   npm start
   # or
   yarn start
   \`\`\`

4. Run the application on a device or emulator:
   \`\`\`
   # For iOS
   npm run ios
   # or
   yarn ios

   # For Android
   npm run android
   # or
   yarn android
   \`\`\`

## Project Structure

- \`/src\`: Source files
  - \`/components\`: Reusable UI components
  - \`/screens\`: Application screens
  - \`/navigation\`: Navigation configurations
  - \`/services\`: API and service integrations
  - \`/hooks\`: Custom React hooks
  - \`/utils\`: Utility functions
  - \`/types\`: TypeScript type definitions
  - \`/assets\`: Static assets (images, fonts, etc.)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`
      );
    }
    
    // Create .gitignore if it doesn't exist
    if (!fs.existsSync(path.join(TEMP_DIR, '.gitignore'))) {
      console.log('Creating .gitignore...');
      fs.writeFileSync(
        path.join(TEMP_DIR, '.gitignore'),
        `# OSX
#
.DS_Store

# Xcode
#
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
ios/.xcode.env.local

# Android/IntelliJ
#
build/
.idea
.gradle
local.properties
*.iml
*.hprof
.cxx/
*.keystore
!debug.keystore

# node.js
#
node_modules/
npm-debug.log
yarn-error.log

# fastlane
#
# It is recommended to not store the screenshots in the git repo. Instead, use fastlane to re-generate the
# screenshots whenever they are needed.
# For more information about the recommended setup visit:
# https://docs.fastlane.tools/best-practices/source-control/

**/fastlane/report.xml
**/fastlane/Preview.html
**/fastlane/screenshots
**/fastlane/test_output

# Bundle artifact
*.jsbundle

# Ruby / CocoaPods
/ios/Pods/
/vendor/bundle/

# Temporary files created by Metro
.metro-health-check*

# Environment variables
.env
.env.*
!.env.example

# TypeScript
*.tsbuildinfo

# Testing
coverage/

# Expo
.expo/
dist/
web-build/
`
      );
    }
    
    // Create a .env.example file if it doesn't exist
    if (!fs.existsSync(path.join(TEMP_DIR, '.env.example'))) {
      console.log('Creating .env.example...');
      fs.writeFileSync(
        path.join(TEMP_DIR, '.env.example'),
        `# API Configuration
API_URL=https://api.shortdramaverse.com
API_VERSION=v1

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_OFFLINE_VIEWING=true

# Third-party Services
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
ANALYTICS_API_KEY=your_analytics_api_key
`
      );
    }
    
    // Create metro.config.js if it doesn't exist
    if (!fs.existsSync(path.join(TEMP_DIR, 'metro.config.js'))) {
      console.log('Creating metro.config.js...');
      fs.writeFileSync(
        path.join(TEMP_DIR, 'metro.config.js'),
        `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
`
      );
    }
    
    // Add all files to git
    console.log('Adding files to Git...');
    execSync(`cd "${TEMP_DIR}" && git add .`, { stdio: 'inherit' });
    
    // Commit files
    console.log('Committing files...');
    execSync(`cd "${TEMP_DIR}" && git commit -m "Initial commit: ShortDramaVerse Mobile Application"`, 
      { stdio: 'inherit' });
    
    // Add GitHub remote and push
    console.log('Adding GitHub remote and pushing...');
    execSync(`cd "${TEMP_DIR}" && git remote add origin https://${GITHUB_TOKEN}@github.com/${githubUsername}/${REPO_NAME}.git`, 
      { stdio: 'pipe' });
    
    // Force push to main branch (will overwrite existing repository if it exists)
    execSync(`cd "${TEMP_DIR}" && git push -u origin main --force`, 
      { stdio: 'inherit' });
    
    console.log('');
    console.log('===========================================');
    console.log(' 🎉 Export completed successfully! 🎉');
    console.log('===========================================');
    console.log(`Repository URL: https://github.com/${githubUsername}/${REPO_NAME}`);
    console.log('');
    console.log('To clone this repository:');
    console.log(`git clone https://github.com/${githubUsername}/${REPO_NAME}.git`);
    console.log('');
    
  } catch (error) {
    console.error('Error during export process:', error);
    process.exit(1);
  } finally {
    // Clean up temporary directory
    console.log('Cleaning up temporary directory...');
    execSync(`rm -rf "${TEMP_DIR}"`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});