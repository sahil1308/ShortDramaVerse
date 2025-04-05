#!/usr/bin/env node

/**
 * GitHub Repository Access Check Script
 * 
 * This script verifies access to the sahil1308/short-drama-verse-mobile repository
 * and confirms that the GitHub token has the necessary permissions.
 */

import { execSync } from 'child_process';

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = "sahil1308";
const REPO_NAME = "short-drama-verse-mobile";

// Check if GitHub token is available
if (!GITHUB_TOKEN) {
  console.error('ERROR: GitHub token not found. Please set the GITHUB_TOKEN environment variable.');
  console.error('You can create a personal access token at https://github.com/settings/tokens');
  process.exit(1);
}

console.log(`Checking access to GitHub repository: ${GITHUB_USERNAME}/${REPO_NAME}...`);

try {
  // Check if the repository exists and is accessible
  const result = execSync(
    `curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}`, 
    { encoding: 'utf8' }
  );
  
  const repoData = JSON.parse(result);
  
  if (repoData.name === REPO_NAME) {
    console.log('✅ Repository access verified successfully!');
    console.log(`Repository: ${repoData.html_url}`);
    console.log(`Description: ${repoData.description || 'No description'}`);
    console.log(`Default branch: ${repoData.default_branch}`);
    
    // Check token permissions
    const tokenResult = execSync(
      `curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/user`, 
      { encoding: 'utf8' }
    );
    
    const tokenData = JSON.parse(tokenResult);
    console.log(`Authenticated as: ${tokenData.login}`);
    
    console.log('');
    console.log('Your GitHub token has the necessary permissions to access the repository.');
    console.log('All sync operations will be directed to this repository.');
  } else {
    console.error('❌ Repository verification failed. The repository may exist but returned unexpected data.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to access the repository. Please check your GitHub token and ensure the repository exists.');
  console.error('Error details:', error.message);
  process.exit(1);
}