// Server-only mode for ShortDramaVerse application
// This script runs just the Express API server without the frontend/Vite

import express from 'express';
import { startServer } from './server/server-utils.js';
import { registerRoutes } from './server/routes.js';
import cors from 'cors';

// Create the Express server
const app = express();

// Set up CORS - allow all origins in development
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up API routes
const server = registerRoutes(app);

// Start server on port 3000
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`
  ========================================
    ShortDramaVerse API Server
  ========================================
  
  Server is running on http://0.0.0.0:${port}
  
  Available API routes:
  - POST /api/register         Create a new user account
  - POST /api/login            Authenticate user
  - POST /api/logout           Log out current user
  - GET  /api/user             Get current user info
  - GET  /api/drama-series     Get all drama series
  - GET  /api/drama-series/:id Get details for a specific series
  - GET  /api/episodes/:id     Get episode details
  - GET  /api/watchlist        Get user's watchlist (auth required)
  
  Use with API client or frontend app
  
  ========================================
  `);
});