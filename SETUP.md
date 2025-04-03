# ShortDramaVerse - Setup Guide

ShortDramaVerse is a web-based streaming platform for short-form drama content. This guide explains how to set up and run the application in any IDE environment.

## Prerequisites

- Node.js (version 16 or higher)
- npm (version 7 or higher)

## Installation

1. Clone the repository to your local machine
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

### Option 1: Standard Development Mode (Recommended)

This starts the application with Vite's built-in development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

> **Important Note for Replit Users**: 
> Due to Replit's security restrictions, you may encounter a Vite host configuration error when trying to access the application in the Replit environment. This is because Vite blocks requests from hosts that aren't explicitly allowed in its configuration.
>
> **Solutions**:
> 1. Use one of the alternative server options below
> 2. When running locally outside of Replit, this issue will not occur

### Option 2: Multiple Server Setup

We provide several server options for development and testing:

1. **Main API Server (port 3000)**
   ```bash
   node server-only.js
   ```

2. **Development Server with Custom UI (port 8080)**
   ```bash
   node dev-server.cjs
   ```

3. **Client Application Server (port 8888)**
   ```bash
   node client-app.js
   ```

4. **All Servers (Convenience Script)**
   ```bash
   ./start-all-servers.sh
   ```

## Authentication

The application includes a complete authentication system with login, registration, and protected routes. To test it:

1. Navigate to http://localhost:3000/auth
2. Register a new account
3. Login with your credentials
4. You will be redirected to the homepage with access to protected content

## Project Structure

- `/client` - Frontend React application
  - `/src` - Source code
    - `/components` - Reusable UI components
    - `/hooks` - Custom React hooks
    - `/lib` - Utility functions
    - `/pages` - Application pages

- `/server` - Backend Express server
  - `index.ts` - Server entry point
  - `routes.ts` - API routes
  - `auth.ts` - Authentication setup
  - `storage.ts` - Data storage interface

- `/shared` - Shared code between client and server
  - `schema.ts` - Data models and validation schemas

## Development Notes

1. The application uses an in-memory database by default for development
2. User sessions are stored in memory and will be lost on server restart
3. For a production setup, configure a proper database connection
4. API authentication uses sessions with cookies

## Troubleshooting

### Vite Host Configuration Issues

If you encounter Vite host configuration issues when running in an IDE's embedded browser, try:

1. Using the dev-server.cjs on port 8080 instead
2. Accessing the application via client-app.js on port 8888
3. Modifying vite.config.ts to add your host to the allowedHosts configuration

### Authentication Problems

If authentication is not working:

1. Check the server.log file for API errors
2. Ensure cookies are enabled in your browser
3. Try using the test scripts to verify API functionality:
   ```bash
   node test-auth-components.cjs
   ```

## Additional Documentation

For more detailed information, refer to:
- DEVELOPMENT.md - Developer guidelines
- USAGE.md - Usage instructions
- README.md - Project overview