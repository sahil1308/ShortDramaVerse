import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import { ApiError } from '@/types/drama';

// Token storage key
const AUTH_TOKEN_KEY = '@ShortDramaVerse:AuthToken';

// Environment variables
const getApiUrl = () => {
  // For production app, this would come from environment configuration
  return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';
};

/**
 * API Service Class
 * Handles API requests, authentication, and error handling
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Initialize axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: getApiUrl(),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if we have token in memory, if not try to load from storage
        if (!this.authToken) {
          this.authToken = await this.getStoredAuthToken();
        }

        // Add auth token to headers if available
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error) => this.handleRequestError(error)
    );

    // Initialize auth token from storage
    this.initializeAuthToken();
  }

  /**
   * Initialize auth token from storage on app start
   */
  private async initializeAuthToken(): Promise<void> {
    try {
      this.authToken = await this.getStoredAuthToken();
    } catch (err) {
      console.error('Failed to initialize auth token:', err);
    }
  }

  /**
   * Get stored auth token from AsyncStorage
   */
  private async getStoredAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (err) {
      console.error('Error retrieving auth token:', err);
      return null;
    }
  }

  /**
   * Store authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      this.authToken = token;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (err) {
      console.error('Error storing auth token:', err);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Clear authentication token
   */
  async clearAuthToken(): Promise<void> {
    try {
      this.authToken = null;
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (err) {
      console.error('Error clearing auth token:', err);
      throw new Error('Failed to clear authentication token');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.authToken) {
      this.authToken = await this.getStoredAuthToken();
    }
    return !!this.authToken;
  }

  /**
   * Handle request errors
   */
  private handleRequestError(error: any): never {
    let errorMessage = 'Network error. Please check your connection.';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        // Server responded with an error status
        statusCode = axiosError.response.status;
        const data = axiosError.response.data;
        
        if (data && data.message) {
          errorMessage = data.message;
        } else if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to access this resource.';
        } else if (statusCode === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (statusCode >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (axiosError.request) {
        // No response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Request setup error
        errorMessage = 'Error setting up the request.';
      }
    }

    // Create unified error object
    const apiError: ApiError = {
      status: statusCode,
      message: errorMessage,
    };

    if (__DEV__) {
      console.error('API Error:', apiError);
    }

    throw apiError;
  }

  /**
   * Make API request
   */
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const fullConfig: AxiosRequestConfig = {
        ...config,
        method,
        url: endpoint,
        data: (method !== 'GET') ? data : undefined,
        params: (method === 'GET') ? data : undefined,
      };

      return await this.axiosInstance.request<any, T>(fullConfig);
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  /**
   * Get API endpoints
   */
  get endpoints() {
    return {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        user: '/auth/user',
      },
      series: {
        list: '/series',
        featured: '/series/featured',
        byId: (id: number) => `/series/${id}`,
        search: '/series/search',
        byGenre: (genre: string) => `/series/genre/${genre}`,
      },
      episodes: {
        list: '/episodes',
        byId: (id: number) => `/episodes/${id}`,
        bySeriesId: (seriesId: number) => `/series/${seriesId}/episodes`,
        purchase: (id: number) => `/episodes/${id}/purchase`,
      },
      watchlist: {
        get: '/watchlist',
        add: '/watchlist/add',
        remove: (seriesId: number) => `/watchlist/remove/${seriesId}`,
      },
      watchHistory: {
        get: '/watch-history',
        update: '/watch-history/update',
      },
      ratings: {
        bySeriesId: (seriesId: number) => `/series/${seriesId}/ratings`,
        add: '/ratings/add',
        update: (id: number) => `/ratings/${id}`,
      },
      transactions: {
        list: '/transactions',
        addCoins: '/transactions/add-coins',
      },
      profile: {
        update: '/profile/update',
        changePassword: '/profile/change-password',
      },
    };
  }
}

// Create and export a singleton instance
const api = new ApiService();
export default api;