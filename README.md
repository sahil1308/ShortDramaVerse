# ShortDramaVerse

ShortDramaVerse is a web-based streaming platform for short-form drama content from around the world. This application provides the core functionality for streaming drama series, user authentication, content management, and administrative tools.

## Features

- **User Authentication**: Secure authentication system with registration, login, and session management
- **Content Browsing**: Browse drama series by genre, popularity, and other criteria
- **Video Streaming**: Watch episodes with progress tracking and user history
- **Watchlist Management**: Add series to personal watchlists
- **Rating System**: Rate and review drama series
- **Admin Interface**: Manage content, users, and advertisements
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## Technical Architecture

ShortDramaVerse is built with:

- **Frontend**: React, TailwindCSS, Shadcn UI components
- **Backend**: Express.js API server
- **Database**: In-memory storage (configurable for PostgreSQL)
- **Authentication**: Passport.js with local strategy
- **Session Management**: Express-session with secure cookie handling
- **API Integration**: React Query for data fetching

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `./start.sh`

### Development

Multiple development server options are available to overcome Vite host restrictions in environments like Replit:

- **Main Application**: `npm run dev` or `./start.sh` 
- **Client App**: `./start-client.sh` - Simplified UI with full API functionality (port 8888)
- **Development Server**: `./start-dev-server.sh` - Testing tools and API interface (port 8080)
- **API Proxy**: `node proxy.js` - API testing interface (port 3333)
- **Server-Only Mode**: `node server-only.js` - Just the API (port 3000)
- **All Servers**: `node start-dev.js` - Starts all servers simultaneously

For detailed usage instructions, see [USAGE.md](USAGE.md).

For comprehensive development instructions, refer to [DEVELOPMENT.md](DEVELOPMENT.md).

## Project Structure

- **`/client`**: Frontend React application
  - **`/src/components`**: Reusable UI components
  - **`/src/hooks`**: Custom React hooks
  - **`/src/lib`**: Utility functions and helpers
  - **`/src/pages`**: Application pages and routes

- **`/server`**: Backend Express API
  - **`/auth.ts`**: Authentication system
  - **`/routes.ts`**: API route definitions
  - **`/storage.ts`**: Data storage interface

- **`/shared`**: Shared code and types
  - **`/schema.ts`**: Database schema and types

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

## License

This project is licensed under the MIT License.