# ShortDramaVerse Mobile

A comprehensive React Native mobile application for iOS and Android that provides a premium short-form drama streaming experience.

## Features

- User authentication and profile management
- Content discovery and recommendations
- Video streaming with playback controls
- Offline viewing capabilities
- Watchlist and viewing history
- In-app purchases and subscriptions
- Push notifications
- Analytics and reporting dashboards
- Admin content management

## Technology Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type safety and improved developer experience
- **React Navigation**: Navigation structure with bottom tabs and stack navigation
- **AsyncStorage**: Local data persistence for offline support
- **Axios**: API communication with interceptors
- **React Query**: Data fetching, caching, and state management
- **React Native Paper**: UI component library
- **React Native Chart Kit**: Data visualization for analytics
- **Expo Vector Icons**: Comprehensive icon library

## Project Structure

```
/src
  /assets            # Static assets (images, fonts, etc.)
  /components        # Reusable UI components
    /analytics       # Analytics-specific components
    DramaCard.tsx    # Card component for displaying drama series
    DramaRow.tsx     # Row component for displaying drama series
    DramaCarousel.tsx # Carousel for featured content
  /hooks             # Custom React hooks
    useAuth.tsx      # Authentication hook
    useAnalytics.tsx # Analytics hook
  /navigation        # Navigation configurations
    RootNavigator.tsx # Root navigation setup
    MainTabs.tsx     # Bottom tab navigation
  /screens           # Application screens
    /admin           # Admin-specific screens
    /auth            # Authentication screens
    /common          # Shared screens
    /home            # Home and discovery screens
    /profile         # User profile screens
    /series          # Series and episode screens
    /watchlist       # Watchlist screens
  /services          # API and service integrations
    api.ts           # API service with Axios
    analytics.ts     # Analytics tracking service
    storage.ts       # Local storage service
  /types             # TypeScript type definitions
    drama.ts         # Drama content type definitions
    navigation.ts    # Navigation type definitions
    user.ts          # User and auth type definitions
  /utils             # Utility functions
    formatters.ts    # Data formatting utilities
  App.tsx            # Main application component
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- React Native development environment setup
  - For iOS: macOS with Xcode installed
  - For Android: Android Studio with SDK tools

### Installation

1. Extract the package:
   ```
   tar -xzvf short-drama-verse-mobile.tar.gz -C /path/to/destination
   cd /path/to/destination
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Install pods for iOS (macOS only):
   ```
   cd ios && pod install && cd ..
   ```

### Running the App

#### Development Mode

1. Start the Metro bundler:
   ```
   npm start
   # or
   yarn start
   ```

2. Run on Android:
   ```
   npm run android
   # or
   yarn android
   ```

3. Run on iOS (macOS only):
   ```
   npm run ios
   # or
   yarn ios
   ```

### Setting Up a GitHub Repository

To set up a GitHub repository for this project:

1. Create a new repository on GitHub

2. Initialize git and push the code:
   ```
   git init
   git add .
   git commit -m "Initial commit: ShortDramaVerse Mobile Application"
   git branch -M main
   git remote add origin https://github.com/your-username/short-drama-verse-mobile.git
   git push -u origin main
   ```

## Development Notes

### API Integration

The application is designed to connect to the ShortDramaVerse backend API. The API service (`src/services/api.ts`) includes:

- Axios instance configuration
- Authentication token management
- Request/response interceptors
- Error handling

### Authentication

Authentication is managed through the `useAuth` hook (`src/hooks/useAuth.tsx`), which provides:

- User login/logout functionality
- Registration
- Profile management
- Token persistence

### Analytics

The application includes comprehensive analytics tracking:

- User engagement metrics
- Content performance analysis
- Session tracking
- Custom event logging

The analytics dashboard provides visualizations for both users and admins.

### Offline Support

The application supports offline functionality:

- Content downloading
- Watch history synchronization
- Queue-based analytics tracking

## License

This project is licensed under the MIT License.