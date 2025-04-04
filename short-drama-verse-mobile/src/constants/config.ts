/**
 * Application Configuration
 * 
 * This file contains configuration constants for the application.
 * It includes API endpoints, timeout settings, and storage keys.
 */

// API Configuration
export const API_CONFIG = {
  // Base URL of the API server
  BASE_URL: 'https://api.shortdramaverse.com',
  
  // API version
  VERSION: 'v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers to include with all requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // API endpoints organized by feature
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/profile',
      CHANGE_PASSWORD: '/user/change-password',
      PREFERENCES: '/user/preferences',
      SUBSCRIPTION: '/user/subscription',
    },
    SERIES: {
      LIST: '/series',
      DETAILS: (id: number | string) => `/series/${id}`,
      FEATURED: '/series/featured',
      TRENDING: '/series/trending',
      RECOMMENDED: '/series/recommended',
      CATEGORIES: '/series/categories',
      SEARCH: '/series/search',
    },
    EPISODES: {
      LIST: (seriesId: number | string) => `/series/${seriesId}/episodes`,
      DETAILS: (episodeId: number | string) => `/episodes/${episodeId}`,
      STREAM: (episodeId: number | string) => `/episodes/${episodeId}/stream`,
      COMMENTS: (episodeId: number | string) => `/episodes/${episodeId}/comments`,
    },
    WATCHLIST: {
      LIST: '/watchlist',
      ADD: '/watchlist/add',
      REMOVE: (id: number | string) => `/watchlist/${id}`,
    },
    ANALYTICS: {
      TRACK_VIEW: '/analytics/view',
      TRACK_ENGAGEMENT: '/analytics/engagement',
      TRACK_COMPLETION: '/analytics/completion',
      USER_ACTIVITY: '/analytics/user-activity',
    },
    ADMIN: {
      DASHBOARD: '/admin/dashboard',
      USERS: '/admin/users',
      CONTENT: '/admin/content',
      ANALYTICS: '/admin/analytics',
      REPORTS: '/admin/reports',
    },
  },
};

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ShortDramaVerse:authToken',
  REFRESH_TOKEN: '@ShortDramaVerse:refreshToken',
  USER: '@ShortDramaVerse:user',
  WATCH_HISTORY: '@ShortDramaVerse:watchHistory',
  SEARCH_HISTORY: '@ShortDramaVerse:searchHistory',
  DEVICE_ID: '@ShortDramaVerse:deviceId',
  PREFERENCES: '@ShortDramaVerse:preferences',
  THEME: '@ShortDramaVerse:theme',
  OFFLINE_CONTENT: '@ShortDramaVerse:offlineContent',
  ANALYTICS_CACHE: '@ShortDramaVerse:analyticsCache',
  ONBOARDING_COMPLETED: '@ShortDramaVerse:onboardingCompleted',
};

// App-wide configuration parameters
export const APP_CONFIG = {
  // Maximum number of items to keep in watch history
  MAX_WATCH_HISTORY_ITEMS: 100,
  
  // Maximum number of items to keep in search history
  MAX_SEARCH_HISTORY_ITEMS: 20,
  
  // Default auto-play setting
  DEFAULT_AUTOPLAY: true,
  
  // Default subtitle language
  DEFAULT_SUBTITLE_LANGUAGE: 'en',
  
  // Default streaming quality (auto, low, medium, high, ultra)
  DEFAULT_STREAMING_QUALITY: 'auto',
  
  // Debug mode (disable in production)
  DEBUG_MODE: __DEV__,
  
  // Time in milliseconds to wait for user inactivity before hiding controls
  PLAYER_CONTROLS_TIMEOUT: 3000,
  
  // Minimum percentage of an episode watched to mark as "continued watching"
  CONTINUE_WATCHING_THRESHOLD: 5,
  
  // Percentage of episode watched to mark as "completed"
  COMPLETION_THRESHOLD: 90,
  
  // Maximum number of download attempts before failing
  MAX_DOWNLOAD_ATTEMPTS: 3,
  
  // Time in milliseconds for analytics events batching
  ANALYTICS_BATCH_INTERVAL: 60000,
  
  // Maximum number of analytics events to batch before sending
  ANALYTICS_BATCH_SIZE: 20,
  
  // Time in milliseconds for app session timeout
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Number of episodes to prefetch when series details are viewed
  EPISODE_PREFETCH_COUNT: 3,
  
  // Maximum number of simultaneously downloaded episodes
  MAX_CONCURRENT_DOWNLOADS: 2,
  
  // Maximum offline storage size (in MB)
  MAX_OFFLINE_STORAGE: 2000, // 2GB
};