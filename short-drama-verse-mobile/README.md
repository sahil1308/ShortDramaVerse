# ShortDramaVerse Mobile App

A React Native mobile application for the ShortDramaVerse platform. This application provides a seamless mobile experience for users to stream short-form drama content.

## Features

- **User Authentication**: Sign up, login, and profile management 
- **Content Browsing**: Browse drama series by genre, popularity, and ratings
- **Video Streaming**: Stream episodes with video player controls
- **Premium Content**: Access premium content through in-app transactions
- **User Engagement**: Ratings, reviews, and watch history tracking
- **Personalization**: Watchlists and content recommendations
- **Offline Viewing**: Download episodes for offline viewing (planned)

## Tech Stack

- **React Native**: Core framework for building the mobile app
- **Expo**: Development platform for React Native
- **React Navigation**: Navigation library for React Native
- **TanStack Query**: Data fetching and state management
- **Axios**: HTTP client for API requests
- **Expo AV**: Media playback functionality
- **AsyncStorage**: Local storage solution

## Project Structure

```
src/
├── assets/             # Images, fonts, and other static assets
├── components/         # Reusable UI components
├── constants/          # App-wide constants and configuration
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Home and browsing screens
│   ├── profile/        # User profile screens
│   ├── search/         # Search functionality
│   ├── series/         # Series details and episode screens
│   └── watchlist/      # Watchlist screens
├── services/           # API and other service integrations
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI
- Android Studio/Xcode (for native development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd short-drama-verse-mobile
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Use Expo Go app to run on your device or run in an emulator

## Backend Integration

The mobile app connects to the ShortDramaVerse backend API. Configure the API endpoint in `src/services/api.ts`.

## Development Guidelines

- Follow the established project structure
- Use TypeScript for type safety
- Follow React Native best practices for performance
- Use React Query for data fetching and caching
- Implement proper error handling for API requests
- Ensure responsive layouts for different screen sizes
- Test on both iOS and Android devices

## License

[MIT License](LICENSE)