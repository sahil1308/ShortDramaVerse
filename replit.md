# ShortDramaVerse - Complete Streaming Platform

## Overview

ShortDramaVerse is a comprehensive streaming platform for short-form drama content with both web and mobile applications. The platform combines a React frontend with an Express backend, featuring authentication, content management, and streaming capabilities. Additionally, it includes a complete React Native mobile application for iOS and Android.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Hybrid Architecture
The project implements a dual-platform approach:
- **Web Application**: React frontend with TypeScript and Express backend
- **Mobile Application**: Complete React Native app with cross-platform compatibility

### Frontend Architecture
- **Web**: React with TypeScript, Vite for development, Tailwind CSS for styling
- **Mobile**: React Native with TypeScript, Expo for development tooling
- **UI Components**: Radix UI components for web, React Native Paper for mobile
- **State Management**: React Query for data fetching and caching
- **Navigation**: Wouter for web routing, React Navigation for mobile

### Backend Architecture
- **Express Server**: RESTful API with middleware support
- **Authentication**: Passport.js with session-based authentication
- **Development Flexibility**: Multiple server configurations for different environments

## Key Components

### Authentication System
- **Web**: Session-based authentication with Passport.js
- **Mobile**: Anonymous authentication with device-based user tracking
- **User Management**: Profile management, admin roles, and session handling

### Content Management
- **Drama Series**: Complete CRUD operations for series and episodes
- **Streaming**: Video playback with adaptive controls
- **Recommendations**: Personalized content suggestions
- **Search & Discovery**: Advanced filtering and search capabilities

### Mobile-Specific Features
- **Anonymous User Tracking**: Device-based identification without mandatory registration
- **Quick-Swipe Interface**: TikTok-like content discovery mechanism
- **Offline Capabilities**: Local data persistence with AsyncStorage
- **Push Notifications**: Rich notification system with banner support
- **Analytics Dashboard**: Comprehensive user engagement tracking

### Data Storage
- **Web**: Configurable storage with in-memory fallback and PostgreSQL support
- **Mobile**: AsyncStorage for local data persistence
- **Schema Management**: Drizzle ORM with shared schemas between platforms

## Data Flow

### Web Application
1. User authentication through `/auth` endpoint
2. Protected routes validate user sessions
3. API calls to `/api/*` endpoints for data operations
4. Real-time updates through React Query

### Mobile Application
1. Anonymous user creation on first launch
2. Device fingerprinting for user identification
3. Local data caching with AsyncStorage
4. Background sync with web API endpoints

### Content Delivery
- Video streaming with adaptive bitrate
- CDN-ready asset management
- Offline viewing capabilities (mobile)
- Progress tracking and resume functionality

## External Dependencies

### Web Dependencies
- **React Ecosystem**: React 18+, React Query, React Hook Form
- **UI Framework**: Radix UI, Tailwind CSS, Shadcn/ui components
- **Backend**: Express, Passport.js, Drizzle ORM
- **Development**: Vite, TypeScript, ESLint

### Mobile Dependencies
- **React Native**: Cross-platform mobile development
- **Navigation**: React Navigation with stack and tab navigators
- **Storage**: AsyncStorage for local data persistence
- **Media**: React Native Video for streaming
- **Analytics**: Custom analytics service with engagement tracking

### Database & Storage
- **PostgreSQL**: Primary database with Drizzle ORM
- **NeonDB**: Serverless PostgreSQL provider
- **In-Memory Storage**: Development fallback option

## Deployment Strategy

### Development Environment
- **Multiple Server Options**: Standard Vite dev server, custom development server, API-only server
- **Replit Compatibility**: Special handling for Replit environment restrictions
- **Hot Reloading**: Vite HMR for web, React Native Fast Refresh for mobile

### Production Considerations
- **Static Asset Serving**: Pre-built client assets served by Express
- **Environment Variables**: Configurable database connections and secrets
- **Proxy Configuration**: Development proxies for API requests
- **Cross-Platform Builds**: Web bundle and mobile app compilation

### Mobile Deployment
- **iOS**: Native iOS app through Expo/React Native CLI
- **Android**: Native Android app with Gradle build system
- **Over-the-Air Updates**: Expo Updates for rapid deployments

The architecture is designed to be scalable, maintainable, and developer-friendly, with clear separation of concerns between web and mobile platforms while sharing common business logic and data models.