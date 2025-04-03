import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ApiError } from '@/types/drama';
import { Platform, Alert } from 'react-native';

// Base URL configuration
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// API endpoints
const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  user: {
    current: '/users/me',
    updateProfile: '/users/profile',
    transactions: '/users/transactions',
  },
  dramaSeries: {
    list: '/drama-series',
    detail: (id: number) => `/drama-series/${id}`,
    episodes: (id: number) => `/drama-series/${id}/episodes`,
    ratings: (id: number) => `/drama-series/${id}/ratings`,
    popular: '/drama-series/popular',
    trending: '/drama-series/trending',
    search: (query: string) => `/drama-series/search?q=${encodeURIComponent(query)}`,
    genres: '/drama-series/genres',
  },
  episodes: {
    detail: (id: number) => `/episodes/${id}`,
    watch: (id: number) => `/episodes/${id}/watch`,
  },
  watchlist: {
    add: '/watchlist',
    remove: (seriesId: number) => `/watchlist/${seriesId}`,
    check: (seriesId: number) => `/watchlist/check/${seriesId}`,
  },
  ratings: {
    add: '/ratings',
    update: (id: number) => `/ratings/${id}`,
    delete: (id: number) => `/ratings/${id}`,
  },
  coins: {
    purchase: '/coins/purchase',
    unlock: (episodeId: number) => `/coins/unlock/${episodeId}`,
  },
  advertisements: {
    active: (placement: string) => `/advertisements/${placement}`,
    click: (id: number) => `/advertisements/${id}/click`,
  },
};

// Create axios instance with default config
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for authorization token
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('Request data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    // Log API responses in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      // Log API errors in development
      if (__DEV__) {
        console.error(
          `❌ API Error: ${error.response.status} ${error.config.url}`, 
          error.response.data
        );
      }
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Token expired or invalid, clear from storage
        await AsyncStorage.removeItem('auth_token');
        
        // You can also implement token refresh logic here if needed
      }
      
      const errorData = error.response.data;
      const apiError: ApiError = {
        message: errorData.message || 'An error occurred',
        status: error.response.status,
        errors: errorData.errors,
      };
      
      return Promise.reject(apiError);
    }
    
    // Network errors or other issues
    return Promise.reject({
      message: error.message || 'Network error. Please check your connection.',
      status: 0,
    });
  }
);

export { instance, endpoints };

// Export a default api object with all the methods
export default {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    instance.get<T>(url, config).then(response => response.data),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.post<T>(url, data, config).then(response => response.data),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.put<T>(url, data, config).then(response => response.data),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.patch<T>(url, data, config).then(response => response.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    instance.delete<T>(url, config).then(response => response.data),
};