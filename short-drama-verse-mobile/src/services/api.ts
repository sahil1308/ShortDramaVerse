import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Define API endpoints
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
    episodes: (seriesId: number) => `/api/series/${seriesId}/episodes`,
    ratings: (seriesId: number) => `/api/series/${seriesId}/ratings`,
    popular: '/api/series/popular',
    trending: '/api/series/trending',
    genres: '/api/genres',
  },
  episodes: {
    detail: (id: number) => `/api/episodes/${id}`,
    watch: (id: number) => `/api/episodes/${id}/watch`,
  },
  user: {
    watchlist: '/api/user/watchlist',
    watchHistory: '/api/user/history',
    profile: (id: number) => `/api/users/${id}`,
    transactions: '/api/user/transactions',
    updateProfile: '/api/user/profile',
  },
  search: {
    query: (q: string) => `/api/search?q=${encodeURIComponent(q)}`,
  },
  advertisements: {
    getByPlacement: (placement: string) => `/api/advertisements/${placement}`,
  },
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 responses (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear stored token
      await AsyncStorage.removeItem('auth_token');
    }
    
    return Promise.reject(error);
  }
);

export default api;