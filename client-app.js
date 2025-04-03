// ShortDramaVerse - Client App Server
// This script starts a simple HTTP server to serve the client application

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.CLIENT_PORT || 8888;
const API_SERVER = process.env.API_SERVER || 'http://localhost:3000';

// Create Express app
const app = express();

// Configure middleware
app.use(express.static(path.join(__dirname, 'client/dist')));

// API proxy middleware
app.use('/api', createProxyMiddleware({
  target: API_SERVER,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  logLevel: 'warn'
}));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(chalk.bold.cyan('\n🎭 ShortDramaVerse Client App'));
  console.log(chalk.cyan('----------------------------'));
  console.log(chalk.green.bold(`✓ Client running at http://localhost:${PORT}`));
  console.log(chalk.green(`✓ API requests proxied to ${API_SERVER}`));
  console.log(chalk.yellow(`\nPress Ctrl+C to stop the server\n`));
});