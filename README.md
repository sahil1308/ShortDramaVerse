# ShortDramaVerse

ShortDramaVerse is a web-based streaming platform for short-form drama content, designed with mobile responsiveness to function like a native mobile application.

## Features

- **User Authentication**: Secure login and registration system
- **Content Library**: Browse and search short drama series 
- **Video Streaming**: Watch episodes with adaptive playback controls
- **Premium Content**: Purchase locked content with virtual coins
- **User Profiles**: Personalized user experience with watch history and watchlists
- **Rating System**: Rate and review drama series
- **Admin Dashboard**: Content management for administrators

## Getting Started

### Quick Start

1. Clone the repository
2. Run the setup script: `./setup.sh`
3. Start the application: `npm run dev`
4. Open your browser to: `http://localhost:3000`

### Alternative Setup Options

For more detailed setup instructions, including running on different environments, see [SETUP.md](SETUP.md).

### Known Issues in Replit Environment

When running in the Replit environment, you may encounter a Vite host configuration error because Replit's security policies prevent the Vite development server from accepting connections from certain hosts. 

**Solutions:**

1. **Use Alternative Servers:**
   ```bash
   # Start the custom development server (port 8080)
   node dev-server.cjs
   
   # Or start a standalone client server (port 8888)
   node client-app.js
   
   # Or start all servers simultaneously
   ./start-all-servers.sh
   ```

2. **Use the Convenience Script:**
   ```bash
   # Start with the appropriate mode
   ./start.sh all
   ```

These alternative servers provide workarounds for the Vite host restrictions in Replit while still allowing you to develop and test the application.

## Usage

### User Interface

- **Home Page**: Browse featured content and recommendations
- **Series Page**: View details about a series and its episodes
- **Episode Player**: Watch episodes with playback controls
- **Profile**: Manage your account, watchlist, and watch history
- **Admin Dashboard**: Manage content and users (admin accounts only)

### Content Access

- Free content can be watched by any registered user
- Premium content requires virtual coins to unlock
- The first episodes of premium series are typically free as previews

### For Developers

- Check [DEVELOPMENT.md](DEVELOPMENT.md) for technical information
- Use the provided test scripts for validating functionality
- Test user accounts:
  - Regular user: username `testuser`, password `password123`
  - Admin user: username `admin`, password `password123`

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query
- **Backend**: Node.js, Express, Passport.js
- **Data Storage**: In-memory with option for PostgreSQL via Drizzle ORM
- **API**: RESTful API with proper authentication and session management

## Project Structure

```
├── client/            # Frontend React application
├── server/            # Backend Express server
├── shared/            # Shared code (schemas, types)
├── scripts/           # Utility scripts
└── docs/              # Documentation
```

## GitHub Integration

This project is configured to automatically sync with GitHub. Any changes made in Replit will be automatically pushed to the connected GitHub repository.

### Automatic Sync

The project includes an auto-sync service that will automatically detect changes and push them to GitHub:

```bash
# Start the auto-sync service
./start-sync.sh

# Stop the auto-sync service
./stop-sync.sh
```

### Manual Sync

If you need to manually sync changes to GitHub:

```bash
./sync-to-github.sh
```

### Initial Setup

If you're setting up the GitHub integration for the first time:

```bash
./setup-github.sh
```

This script will create a new GitHub repository and configure automatic syncing.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

This project is proprietary and not licensed for public use or distribution.

## Contact

For inquiries about this project, please contact the project maintainers.