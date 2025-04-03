#!/usr/bin/env node

/**
 * Auto-Sync Script
 * 
 * This script watches for file changes and automatically
 * syncs them to GitHub. It's an alternative to cron jobs
 * which aren't available in the Replit environment.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SYNC_INTERVAL = 10 * 1000; // 10 seconds for testing // 5 minutes in milliseconds
const ROOT_DIR = path.resolve(__dirname);
const IGNORED_DIRS = ['.git', 'node_modules', 'dist', '.cache', 'tmp', 'temp'];
const IGNORED_FILES = ['.DS_Store', '*.log', '*.tmp'];

let lastHash = '';

// Helper function to calculate a hash of all files
function calculateFileHash() {
  let fileContents = '';
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      // Skip ignored directories and files
      if (file.isDirectory()) {
        if (!IGNORED_DIRS.includes(file.name)) {
          processDirectory(fullPath);
        }
        continue;
      }
      
      // Skip ignored files
      if (IGNORED_FILES.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(file.name);
        }
        return file.name === pattern;
      })) {
        continue;
      }
      
      try {
        const stats = fs.statSync(fullPath);
        fileContents += `${fullPath}:${stats.size}:${stats.mtime.getTime()};`;
      } catch (err) {
        console.error(`Error reading file ${fullPath}:`, err.message);
      }
    }
  }
  
  processDirectory(ROOT_DIR);
  return crypto.createHash('md5').update(fileContents).digest('hex');
}

// Sync changes to GitHub
function syncToGitHub() {
  try {
    console.log('Checking for changes to sync...');
    
    const currentHash = calculateFileHash();
    
    if (currentHash !== lastHash) {
      console.log('Changes detected, syncing to GitHub...');
      
      try {
        // Execute the sync script
        execSync('./sync-to-github.sh', { stdio: 'inherit' });
        console.log('Sync completed successfully!');
      } catch (error) {
        console.error('Error during sync:', error.message);
      }
      
      lastHash = currentHash;
    } else {
      console.log('No changes detected.');
    }
  } catch (error) {
    console.error('Error in syncToGitHub:', error.message);
  }
}

// Main function
function main() {
  console.log('Starting GitHub Auto-Sync Service');
  console.log(`Watching for changes every ${SYNC_INTERVAL / 1000} seconds...`);
  
  // Calculate initial hash
  lastHash = calculateFileHash();
  
  // Schedule regular sync
  setInterval(syncToGitHub, SYNC_INTERVAL);
}

main();