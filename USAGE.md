# ShortDramaVerse Usage Guide

This guide explains how to use the ShortDramaVerse application in different development and testing configurations.

## Development Environment Options

ShortDramaVerse provides multiple server configurations to facilitate development and testing in various environments, including Replit, which has certain restrictions with Vite's host configuration.

### Main Application Server

The primary application server, which runs both the React frontend and Express backend:

```bash
npm run dev
# or
./start.sh
```

This option uses Vite's development server with HMR (Hot Module Replacement) and serves the application on the default port.

### Client-Only Application

A simplified client application that connects to the main API:

```bash
./start-client.sh
```

- **Port**: 8888
- **Features**: 
  - Full React frontend UI
  - Connects to the API running on port 3000
  - Useful for testing UI changes independently

### Development Testing Server

A dedicated testing server with helpful tools for API testing:

```bash
./start-dev-server.sh
```

- **Port**: 8080
- **Features**:
  - API endpoint testing interface
  - Authentication testing page
  - Detailed documentation
  - API request examples

### API Proxy Server

A simple proxy server for testing API endpoints:

```bash
node proxy.js
```

- **Port**: 3333
- **Features**:
  - API endpoint forwarding
  - Minimal interface for API testing
  - Useful for direct API access

### Server-Only Mode

Run only the backend API server:

```bash
node server-only.js
```

- **Port**: 3000
- **Features**:
  - Full API functionality
  - No frontend UI
  - Useful for API development and testing

### All Servers Simultaneously

Start all development servers at once:

```bash
node start-dev.js
```

This command starts all the servers mentioned above, allowing you to access the application through multiple interfaces simultaneously.

## API Endpoints

### Authentication

- `POST /api/register`: Create a new user account
- `POST /api/login`: Authenticate a user
- `POST /api/logout`: End a user session
- `GET /api/user`: Get the current authenticated user

### Content

- `GET /api/drama-series`: Get all drama series
- `GET /api/drama-series/:id`: Get details for a specific series
- `GET /api/episodes/:seriesId`: Get episodes for a series

### User Data

- `GET /api/watchlist`: Get user's watchlist
- `POST /api/watchlist`: Add a series to watchlist
- `DELETE /api/watchlist/:id`: Remove from watchlist
- `GET /api/watch-history`: Get user's watch history
- `POST /api/watch-history`: Add to watch history

### Admin

- `GET /api/admin/users`: Get all users
- `GET /api/admin/ads`: Get all advertisements
- `POST /api/admin/ads`: Create a new advertisement

## Development Testing

The Development Testing Server (port 8080) provides several useful testing pages:

- **Home Page**: Overview of available testing tools
- **API Tester**: Interface for testing API endpoints
- **Authentication**: Test user registration and login
- **About**: Information about the development environment

## Troubleshooting

### Connection Issues

If you experience connection issues with the main application server:

1. Try using the Client-Only Application (`./start-client.sh`)
2. Ensure the API server is running (`node server-only.js`)
3. Check the API using the Development Testing Server (`./start-dev-server.sh`)

### Authentication Problems

If you experience authentication issues:

1. Visit the Authentication page on the Development Testing Server (http://localhost:8080/auth)
2. Test logging in or registering a new account
3. Verify session cookies are being set properly

### API Errors

For API-related errors:

1. Use the API Tester page (http://localhost:8080/api-test) to test specific endpoints
2. Check the server logs for error messages
3. Verify the request payload matches the expected format

## Mobile Development

ShortDramaVerse is designed to be mobile-responsive. To test the mobile experience:

1. Start the application using any of the server options
2. Use your browser's device emulation tools (available in Chrome DevTools)
3. Test the responsive layout on various device sizes