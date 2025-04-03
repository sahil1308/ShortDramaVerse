// ShortDramaVerse - Development Starter
// This script coordinates starting the development environment

import { spawn } from 'child_process';
import chalk from 'chalk';

console.log(chalk.bold.cyan('\n🎬 ShortDramaVerse Development Environment'));
console.log(chalk.cyan('----------------------------------------'));

// Start the main dev server which handles both frontend and backend
console.log(chalk.yellow('Starting development server...'));

const devProcess = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit',
  shell: true 
});

// Handle process exit
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down development environment...'));
  devProcess.kill('SIGINT');
  process.exit(0);
});

// Log any errors
devProcess.on('error', (err) => {
  console.error(chalk.red('Error starting development server:'), err);
});

// Check if process exited abnormally
devProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(chalk.red(`Development server exited with code ${code}`));
    console.log(chalk.yellow('Try running alternative servers with:'));
    console.log(chalk.yellow('  node server-only.js    # API server only'));
    console.log(chalk.yellow('  node dev-server.cjs    # Alternative dev server'));
    console.log(chalk.yellow('  ./start-all-servers.sh # All servers'));
  }
});