# ShortDramaVerse - Developer Guide

This document provides technical information and guidelines for developers working on the ShortDramaVerse platform.

## Architecture Overview

ShortDramaVerse follows a modern web application architecture with:

- **React frontend** with TypeScript for type safety
- **Express backend** handling API requests
- **Shared schemas** for consistent data validation
- **In-memory storage** with option for PostgreSQL database
- **Authentication** using Passport.js with sessions

### Directory Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── assets/     # Static assets
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   ├── pages/      # Application pages
│   │   └── App.tsx     # Main application component
│
├── server/             # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── auth.ts         # Authentication setup
│   ├── storage.ts      # Data storage interface
│   └── server-utils.ts # Server utility functions
│
└── shared/             # Shared code between client and server
    └── schema.ts       # Data models and validation schemas
```

## Setting Up Development Environment

### Prerequisites

- Node.js v16 or higher
- npm v7 or higher
- Git

### Initial Setup

1. Clone the repository
2. Run the setup script: `./setup.sh`
3. Start the application: `npm run dev`

### Alternative Development Servers

For development scenarios requiring multiple servers:

1. **Main API Server**: `node server-only.js` (port 3000)
2. **Development Server**: `node dev-server.cjs` (port 8080)
3. **Client Application**: `node client-app.js` (port 8888)
4. **All Servers**: `./start-all-servers.sh`

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use functional components with hooks for React
- Document complex functions and components

### Frontend Development

#### Component Structure

- Use shadcn UI components when possible
- Implement responsive design for all components
- Create reusable components in the components directory
- Use CSS modules or styled-components for styling

#### State Management

- Use React Query for server state
- Use React Context for global application state
- Follow React Query patterns for data fetching and caching

#### Routing

- Use wouter for routing
- Create new pages in the pages directory
- Protect routes using the ProtectedRoute component

### Backend Development

#### API Routes

- Create RESTful endpoints in routes.ts
- Validate request data using Zod schemas
- Use storage interface for all data operations
- Return appropriate HTTP status codes

#### Authentication

- Authentication is handled by Passport.js
- Session data is stored in memory or database
- Protect sensitive routes with authentication middleware

#### Storage

- Implement CRUD operations in the storage interface
- Use in-memory storage for development
- PostgreSQL is available for production via Drizzle ORM

### Data Schema

- Define models in schema.ts
- Use Drizzle for database schema definition
- Create validation schemas using drizzle-zod

## Testing

### Running Tests

- Use the provided test scripts in the root directory
- Test authentication: `node test-auth-components.cjs`
- Test API endpoints: `node test-api.js`

### Manual Testing

For manual testing of functionality:

1. Start the application
2. Register a new user or use test accounts:
   - Regular user: username `testuser`, password `password123`
   - Admin user: username `admin`, password `password123`
3. Test user flows through the application

## Deployment

### Environment Setup

1. Configure environment variables (see .env.example)
2. Set up a PostgreSQL database for production
3. Update the storage implementation to use the database

### Build Process

1. Build the client: `npm run build:client`
2. Build the server: `npm run build:server`
3. Deploy the built files to your hosting platform

## Troubleshooting

### Common Development Issues

#### Vite Host Configuration

If you encounter Vite host configuration issues:
- Check that Vite is configured to allow your host
- Use the development server `dev-server.cjs` instead
- Configure proxying if needed

#### Authentication Problems

For authentication issues:
- Check server logs for detailed errors
- Verify that cookies are being properly set
- Ensure credentials are being passed correctly

#### Database Connectivity

If using a database:
- Verify connection string in environment variables
- Check that database schema matches application expectations
- Test database connection independently

## Contributing

1. Create a new branch for your feature or fix
2. Make your changes following the guidelines
3. Write tests for your changes
4. Submit a pull request with a clear description
5. Ensure CI passes before requesting review

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Shadcn UI Documentation](https://ui.shadcn.com/)