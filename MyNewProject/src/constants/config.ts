/**
 * Application Configuration
 * 
 * Contains all configuration settings for the application.
 * This allows for easy modification of app settings in one place.
 */

// Base API configuration
export const API_CONFIG = {
  // Base URL - this would be changed for different environments
  BASE_URL: 'https://api.shortdramaverse.com',
  
  // API version
  VERSION: 'v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 15000,
  
  // Default headers for API requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // API endpoints grouped by functionality
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/profile',
      CHANGE_PASSWORD: '/user/change-password',
      PREFERENCES: '/user/preferences',
    },
    SERIES: {
      LIST: '/series',
      TRENDING: '/series/trending',
      RECOMMENDED: '/series/recommended',
      POPULAR: '/series/popular',
      RECENT: '/series/recent',
      DETAILS: (id: number | string) => `/series/${id}`,
      EPISODES: (id: number | string) => `/series/${id}/episodes`,
      SEARCH: '/series/search',
      GENRES: '/series/genres',
      BY_GENRE: (genre: string) => `/series/genre/${genre}`,
    },
    EPISODES: {
      DETAILS: (id: number | string) => `/episodes/${id}`,
      STREAM: (id: number | string) => `/episodes/${id}/stream`,
      COMMENTS: (id: number | string) => `/episodes/${id}/comments`,
      RELATED: (id: number | string) => `/episodes/${id}/related`,
    },
    WATCHLIST: {
      GET: '/watchlist',
      ADD: '/watchlist/add',
      REMOVE: '/watchlist/remove',
    },
    WATCH_HISTORY: {
      GET: '/history',
      ADD: '/history/add',
      CLEAR: '/history/clear',
    },
    RATINGS: {
      GET: (seriesId: number | string) => `/ratings/series/${seriesId}`,
      ADD: '/ratings/add',
      UPDATE: (id: number | string) => `/ratings/${id}`,
      DELETE: (id: number | string) => `/ratings/${id}`,
    },
    ANALYTICS: {
      USER: '/analytics/user',
      CONTENT: '/analytics/content',
      ADMIN: '/analytics/admin',
      TRENDS: '/analytics/trends',
    },
    SUBSCRIPTION: {
      PLANS: '/subscriptions/plans',
      SUBSCRIBE: '/subscriptions/subscribe',
      CANCEL: '/subscriptions/cancel',
      STATUS: '/subscriptions/status',
    },
    TRANSACTIONS: {
      LIST: '/transactions',
      DETAILS: (id: number | string) => `/transactions/${id}`,
    },
    COINS: {
      BALANCE: '/coins/balance',
      BUY: '/coins/buy',
      PURCHASE: '/coins/purchase',
      HISTORY: '/coins/history',
    },
    ADMIN: {
      USERS: '/admin/users',
      SERIES: '/admin/series',
      EPISODES: '/admin/episodes',
      ANALYTICS: '/admin/analytics',
      REPORTS: '/admin/reports',
      SETTINGS: '/admin/settings',
    },
  },
};

// General app configuration
export const APP_CONFIG = {
  // App name
  APP_NAME: 'ShortDramaVerse',
  
  // Version information
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Feature flags
  FEATURES: {
    OFFLINE_VIEWING: true,
    PUSH_NOTIFICATIONS: true,
    IN_APP_PURCHASES: true,
    DARK_MODE: true,
    USER_ANALYTICS: true,
    CONTENT_RECOMMENDATIONS: true,
    SOCIAL_SHARING: true,
  },
  
  // Default settings
  DEFAULTS: {
    LANGUAGE: 'en',
    THEME: 'light',
    AUTOPLAY: true,
    QUALITY: 'auto',
    SUBTITLE_LANGUAGE: 'en',
    NOTIFICATIONS_ENABLED: true,
  },
  
  // Storage keys for AsyncStorage
  STORAGE_KEYS: {
    AUTH_TOKEN: '@ShortDramaVerse:authToken',
    REFRESH_TOKEN: '@ShortDramaVerse:refreshToken',
    USER: '@ShortDramaVerse:user',
    SETTINGS: '@ShortDramaVerse:settings',
    WATCH_HISTORY: '@ShortDramaVerse:watchHistory',
    DOWNLOADS: '@ShortDramaVerse:downloads',
    SEARCH_HISTORY: '@ShortDramaVerse:searchHistory',
  },
  
  // Content settings
  CONTENT: {
    MAX_SEARCH_HISTORY: 20,
    MAX_RECENT_SERIES: 10,
    EPISODES_PER_PAGE: 20,
    COMMENTS_PER_PAGE: 10,
  },
  
  // App URLs
  URLS: {
    PRIVACY_POLICY: 'https://shortdramaverse.com/privacy',
    TERMS_OF_SERVICE: 'https://shortdramaverse.com/terms',
    HELP_CENTER: 'https://shortdramaverse.com/help',
    CONTACT_US: 'https://shortdramaverse.com/contact',
  },
};