import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API endpoints
export const endpoints = {
  auth: {
    login: '/api/login',
    register: '/api/register',
    logout: '/api/logout',
    user: '/api/user',
  },
  series: {
    list: '/api/series',
    detail: (id: number) => `/api/series/${id}`,
    episodes: (id: number) => `/api/series/${id}/episodes`,
    ratings: (id: number) => `/api/series/${id}/ratings`,
    popular: '/api/series/popular',
    trending: '/api/series/trending',
    search: (query: string) => `/api/series/search?q=${encodeURIComponent(query)}`,
  },
  episodes: {
    detail: (id: number) => `/api/episodes/${id}`,
    watch: (id: number) => `/api/episodes/${id}/watch`,
  },
  user: {
    watchlist: '/api/user/watchlist',
    watchHistory: '/api/user/watch-history',
    updateProfile: '/api/user/profile',
    transactions: '/api/user/transactions',
  },
  ratings: {
    add: '/api/ratings',
    update: (id: number) => `/api/ratings/${id}`,
    delete: (id: number) => `/api/ratings/${id}`,
  },
  watchlist: {
    add: '/api/watchlist',
    remove: (seriesId: number) => `/api/watchlist/${seriesId}`,
    check: (seriesId: number) => `/api/watchlist/check/${seriesId}`,
  },
  transactions: {
    purchase: '/api/transactions/purchase',
    coins: '/api/transactions/coins',
  },
};

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // For network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // For authentication errors, logout user
    if (error.response.status === 401) {
      // Auth token might be expired, will be handled in the useAuth hook
      console.warn('Authentication error:', error.response.data);
    }

    return Promise.reject(new Error(message));
  }
);

// Check if error is an unauthorized error
export const isUnauthorizedError = (error: any): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

// Get resource URL (for images, videos, etc.)
export const getResourceUrl = (path: string): string => {
  // If the path is a full URL, return it as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, prepend the API base URL
  return `${api.defaults.baseURL}${path}`;
};

export default api;