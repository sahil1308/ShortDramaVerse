#!/usr/bin/env node

/**
 * GitHub Repository Export Script
 * 
 * This script exports the ShortDramaVerse Mobile application to a new GitHub repository.
 * It creates a new repository if one doesn't exist, or updates an existing one.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

try {
  console.log(`Exporting ShortDramaVerse Mobile from ${SOURCE_DIR} to GitHub...`);
  
  // Copy files to the temporary directory
  console.log('Copying files to temporary directory...');
  execSync(`cp -r "${SOURCE_DIR}/." "${TEMP_DIR}"`);
  
  // Initialize git repository in the temporary directory
  console.log('Initializing Git repository...');
  execSync(`cd "${TEMP_DIR}" && git init`);
  
  // Create GitHub repository or use existing one
  console.log('Checking if GitHub repository exists...');
  let repoExists = false;
  
  try {
    execSync(`curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/${process.env.USER || 'your-username'}/${REPO_NAME}`, 
      { stdio: 'pipe' });
    repoExists = true;
    console.log(`GitHub repository ${REPO_NAME} already exists, will push to existing repository.`);
  } catch (error) {
    console.log(`GitHub repository ${REPO_NAME} does not exist, creating now...`);
    
    // Create new repository
    execSync(`curl -s -X POST -H "Authorization: token ${GITHUB_TOKEN}" \
      -d '{"name":"${REPO_NAME}", "description":"${REPO_DESCRIPTION}", "private":true}' \
      https://api.github.com/user/repos`, 
      { stdio: 'inherit' });
    
    console.log(`GitHub repository ${REPO_NAME} created successfully.`);
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
   git clone https://github.com/your-username/${REPO_NAME}.git
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
  
  // Create a package.json in the temporary directory if it doesn't exist
  if (!fs.existsSync(path.join(TEMP_DIR, 'package.json'))) {
    console.log('Creating package.json...');
    const packageJson = {
      name: "short-drama-verse-mobile",
      version: "0.1.0",
      private: true,
      scripts: {
        "android": "react-native run-android",
        "ios": "react-native run-ios",
        "start": "react-native start",
        "test": "jest",
        "lint": "eslint ."
      },
      dependencies: {
        "react": "18.2.0",
        "react-native": "0.72.4",
        "@react-navigation/bottom-tabs": "^6.5.8",
        "@react-navigation/native": "^6.1.7",
        "@react-navigation/native-stack": "^6.9.13",
        "@react-navigation/stack": "^6.3.17",
        "@tanstack/react-query": "^4.32.6",
        "axios": "^1.4.0",
        "@react-native-async-storage/async-storage": "^1.19.2",
        "react-native-gesture-handler": "^2.12.1",
        "react-native-safe-area-context": "^4.7.1",
        "react-native-screens": "^3.24.0",
        "react-native-svg": "^13.11.0",
        "react-native-reanimated": "^3.4.2",
        "@expo/vector-icons": "^13.0.0",
        "react-native-paper": "^5.10.1",
        "react-native-chart-kit": "^6.12.0"
      },
      devDependencies: {
        "@babel/core": "^7.20.0",
        "@babel/preset-env": "^7.20.0",
        "@babel/runtime": "^7.20.0",
        "@react-native/eslint-config": "^0.72.2",
        "@react-native/metro-config": "^0.72.9",
        "@tsconfig/react-native": "^3.0.0",
        "@types/react": "^18.0.24",
        "@types/react-test-renderer": "^18.0.0",
        "babel-jest": "^29.2.1",
        "eslint": "^8.19.0",
        "jest": "^29.2.1",
        "metro-react-native-babel-preset": "0.76.7",
        "prettier": "^2.4.1",
        "react-test-renderer": "18.2.0",
        "typescript": "4.8.4"
      },
      jest: {
        "preset": "react-native"
      }
    };
    
    fs.writeFileSync(
      path.join(TEMP_DIR, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
  
  // Create tsconfig.json if it doesn't exist
  if (!fs.existsSync(path.join(TEMP_DIR, 'tsconfig.json'))) {
    console.log('Creating tsconfig.json...');
    const tsConfig = {
      extends: "@tsconfig/react-native/tsconfig.json",
      compilerOptions: {
        jsx: "react-native",
        strict: true,
        baseUrl: ".",
        paths: {
          "@/*": ["src/*"]
        },
        esModuleInterop: true,
        skipLibCheck: true,
        types: ["react-native", "jest"]
      },
      include: ["src/**/*", "index.js"],
      exclude: [
        "node_modules",
        "babel.config.js",
        "metro.config.js",
        "jest.config.js"
      ]
    };
    
    fs.writeFileSync(
      path.join(TEMP_DIR, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }
  
  // Create a babel.config.js in the temporary directory if it doesn't exist
  if (!fs.existsSync(path.join(TEMP_DIR, 'babel.config.js'))) {
    console.log('Creating babel.config.js...');
    fs.writeFileSync(
      path.join(TEMP_DIR, 'babel.config.js'),
      `module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]
};
`
    );
  }
  
  // Create index.js in the temporary directory if it doesn't exist
  if (!fs.existsSync(path.join(TEMP_DIR, 'index.js'))) {
    console.log('Creating index.js...');
    fs.writeFileSync(
      path.join(TEMP_DIR, 'index.js'),
      `/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
`
    );
  }
  
  // Create app.json in the temporary directory if it doesn't exist
  if (!fs.existsSync(path.join(TEMP_DIR, 'app.json'))) {
    console.log('Creating app.json...');
    fs.writeFileSync(
      path.join(TEMP_DIR, 'app.json'),
      JSON.stringify({
        name: "ShortDramaVerse",
        displayName: "ShortDramaVerse"
      }, null, 2)
    );
  }
  
  // Create metro.config.js in the temporary directory if it doesn't exist
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
  execSync(`cd "${TEMP_DIR}" && git remote add origin https://${GITHUB_TOKEN}@github.com/${process.env.USER || 'your-username'}/${REPO_NAME}.git`, 
    { stdio: 'pipe' });
  
  // Force push to main branch (will overwrite existing repository if it exists)
  execSync(`cd "${TEMP_DIR}" && git push -u origin main --force`, 
    { stdio: 'inherit' });
  
  console.log('');
  console.log('===========================================');
  console.log(' 🎉 Export completed successfully! 🎉');
  console.log('===========================================');
  console.log(`Repository URL: https://github.com/${process.env.USER || 'your-username'}/${REPO_NAME}`);
  console.log('');
  console.log('To clone this repository:');
  console.log(`git clone https://github.com/${process.env.USER || 'your-username'}/${REPO_NAME}.git`);
  console.log('');
  
} catch (error) {
  console.error('Error during export process:', error);
  process.exit(1);
} finally {
  // Clean up temporary directory
  console.log('Cleaning up temporary directory...');
  execSync(`rm -rf "${TEMP_DIR}"`);
}