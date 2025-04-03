// ShortDramaVerse Development Server
// Combined server script that runs multiple servers in parallel

import { spawn } from 'child_process';
import chalk from 'chalk';

// Configuration
const servers = [
  {
    name: 'Main Server',
    command: 'node',
    args: ['server-only.js'],
    color: chalk.green,
    port: 3000
  },
  {
    name: 'Client App',
    command: 'node',
    args: ['client-app.js'],
    color: chalk.blue,
    port: 8888
  },
  {
    name: 'API Proxy',
    command: 'node',
    args: ['proxy.js'],
    color: chalk.magenta,
    port: 3333
  },
  {
    name: 'Dev Server',
    command: 'node',
    args: ['dev-server.js'],
    color: chalk.yellow,
    port: 8080
  }
];

// Print banner
console.log(chalk.bold.cyan('\n========================================'));
console.log(chalk.bold.cyan('   ShortDramaVerse Development Suite'));
console.log(chalk.bold.cyan('========================================\n'));
console.log(chalk.cyan('Starting all development servers...\n'));

// Start each server
const processes = servers.map(server => {
  console.log(`${server.color(`[${server.name}]`)} Starting on port ${server.port}...`);
  
  const process = spawn(server.command, server.args);
  
  process.stdout.on('data', (data) => {
    console.log(`${server.color(`[${server.name}]`)} ${data.toString().trim()}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`${server.color(`[${server.name}] ERROR:`)} ${data.toString().trim()}`);
  });
  
  process.on('close', (code) => {
    if (code !== 0) {
      console.log(`${server.color(`[${server.name}]`)} process exited with code ${code}`);
    }
  });
  
  return process;
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down all servers...'));
  processes.forEach(p => p.kill());
  process.exit(0);
});

console.log(chalk.bold.green('\nAll servers started! Access points:'));
console.log(chalk.green('Main Server:  ') + chalk.white(`http://0.0.0.0:3000`));
console.log(chalk.green('Client App:   ') + chalk.white(`http://0.0.0.0:8888`));
console.log(chalk.green('API Proxy:    ') + chalk.white(`http://0.0.0.0:3333`));
console.log(chalk.green('Dev Server:   ') + chalk.white(`http://0.0.0.0:8080`));
console.log(chalk.cyan('\nPress Ctrl+C to stop all servers\n'));