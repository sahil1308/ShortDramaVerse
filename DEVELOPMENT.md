# ShortDramaVerse Development Guide

This document provides a comprehensive guide for developing and working with the ShortDramaVerse application in the Replit environment. Due to certain host restrictions in Replit, we've implemented a flexible development setup with multiple runtime options.

## Understanding the Environment

ShortDramaVerse is a full-stack application consisting of:

- **Backend API**: Express.js server with authentication and data storage
- **Frontend**: React-based client using Vite for development

In Replit, we face some challenges:

1. **Vite Host Restrictions**: Vite's development server sometimes has issues with Replit's host configuration
2. **Port Limitations**: We need to manage multiple services on different ports
3. **Workflow Integration**: Replit's workflow system needs specific port configurations

## Development Scripts

We've created several scripts to help you work with the application in different modes:

### `start.sh` - Main Development Launcher

This script provides a menu to choose your preferred development mode:

```bash
./start.sh
```

Options include:

1. **Full Stack Mode**: Runs API server, proxies, and development servers together
2. **API Server Only**: Runs just the backend API server
3. **Client App Only**: Runs a simplified HTML client that connects to the API
4. **Development Server**: Runs a custom dev server with API proxy and UI
5. **API Proxy**: Runs an API testing interface

### Development Server Scripts

- `start-servers.sh`: Starts all server components together with proper cleanup
- `start-dev.js`: Starts all development servers simultaneously
- `start-client.sh`: Runs only the client application on port 8888
- `start-dev-server.sh`: Runs the development testing server on port 8080
- `server-only.js`: Runs only the API server on port 3000
- `run-proxy-dev.sh`: Legacy script for starting just the proxy server
- `test-api.js`: Script to test API endpoints from the command line

## Server Components

The application uses several server components:

### Main API Server (Port 3000)

This is the core Express.js server that provides the API endpoints, authentication, and data storage. It's configured in `server/index.ts` and can run in development or production mode.

### Development Server (Port 8080)

A simplified HTTP server that provides:
- API proxy to the main API server
- Static HTML UI for basic interaction
- Testing tools for API requests

### API Proxy (Port 3333)

A dedicated proxy server for testing API endpoints with:
- UI for making API requests
- JSON request builder
- Response viewer

### Client App (Port 8888)

A simplified client application that:
- Connects to the API server
- Provides basic authentication UI
- Displays application information

## Authentication System

The authentication system is implemented with:

- **Passport.js**: For authentication middleware
- **Express-session**: For session management
- **Memory store**: For session storage in development

The main authentication endpoints are:

- **POST /api/register**: Create a new user account
- **POST /api/login**: Authenticate a user
- **POST /api/logout**: End a user session
- **GET /api/user**: Get the current authenticated user

## Working with the Codebase

### Server-Side Code

- `server/routes.ts`: API route definitions
- `server/auth.ts`: Authentication setup
- `server/storage.ts`: Data storage interface and implementation
- `server/server-utils.ts`: Utility functions for server creation

### Development Tools

- `dev-server.js`: Development server implementation
- `proxy.js`: API proxy implementation
- `proxy-server.js`: Combined proxy for API and Vite
- `client-app.js`: Simplified client application

## Common Development Tasks

### Adding New API Endpoints

1. Add the endpoint definition in `server/routes.ts`
2. Implement any required storage methods in `server/storage.ts`
3. Test the endpoint with the API Proxy or test script

### Troubleshooting Vite Issues

If you encounter issues with Vite in Replit:

1. Stop any running servers
2. Run `./start.sh` and select option 3 or 4
3. Use the simplified interfaces to continue development
4. Try running the full stack mode again after changes

### Testing Authentication

You can test authentication using:

1. The API Proxy interface
2. The simplified client app
3. The `test-api.js` script

## Deployment

For deployment, the application uses:

- **Express.js Static Serving**: In production mode, Express serves the built frontend
- **Single HTTP Server**: All requests go through a single HTTP server in production

To prepare for deployment:

1. Build the frontend: `npm run build`
2. Set NODE_ENV to "production"
3. Start the server: `node server/index.js`