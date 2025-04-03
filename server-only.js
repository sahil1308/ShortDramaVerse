// ShortDramaVerse - Server-Only Script
// This script starts only the backend API server

import { startServer } from './server/server-utils.js';
import chalk from 'chalk';

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log(chalk.bold.cyan('\n🎬 ShortDramaVerse API Server'));
console.log(chalk.cyan('----------------------------'));

// Start the server
try {
  const { server } = startServer({
    port: PORT,
    host: HOST,
    enableCors: true,
    enableAuth: true,
    trustProxy: true
  });

  console.log(chalk.green.bold(`✓ API server running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`));
  console.log(chalk.green(`✓ Authentication enabled`));
  console.log(chalk.green(`✓ CORS enabled`));
  console.log(chalk.yellow(`\nPress Ctrl+C to stop the server\n`));
} catch (error) {
  console.error(chalk.red.bold('Error starting server:'));
  console.error(chalk.red(error.message));
  console.error(error.stack);
  process.exit(1);
}