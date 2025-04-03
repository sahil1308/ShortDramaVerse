// ShortDramaVerse Server Only
// This script starts just the main server without any Vite middleware for development

import express from 'express';
import cors from 'cors';
import { registerRoutes } from './server/routes.js';
import { setupAuth } from './server/auth.js';
import session from 'express-session';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);

// Create Express app
const app = express();
const port = 3000;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true
}));

// Configure session
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
};

// Use session middleware
app.use(session(sessionConfig));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup authentication
setupAuth(app);

// Register API routes
const httpServer = registerRoutes(app);

// API routes middleware
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Add API information route
app.get('/api', (req, res) => {
  res.json({
    name: 'ShortDramaVerse API',
    version: '1.0.0',
    endpoints: [
      { method: 'POST', path: '/api/register', description: 'Create a new user account' },
      { method: 'POST', path: '/api/login', description: 'Authenticate user' },
      { method: 'POST', path: '/api/logout', description: 'Log out current user' },
      { method: 'GET', path: '/api/user', description: 'Get current user info' },
      { method: 'GET', path: '/api/drama-series', description: 'Get all drama series' },
      { method: 'GET', path: '/api/drama-series/:id', description: 'Get details for a specific series' },
      { method: 'GET', path: '/api/drama-series/:seriesId/episodes', description: 'Get episodes for a series' },
      { method: 'GET', path: '/api/watchlist', description: 'Get user\'s watchlist' },
      { method: 'POST', path: '/api/watchlist', description: 'Add series to watchlist' },
    ]
  });
});

// Start the server
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Server-only mode: API server running at http://0.0.0.0:${port}`);
});