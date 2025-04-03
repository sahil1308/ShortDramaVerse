import { ApiError, ApiResponse } from '@/types/drama';
import { getToken, removeToken } from '@/services/storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the dev server IP in development or use production URL
const DEV_API_URL = 'http://localhost:3000/api';
const PROD_API_URL = 'https://shortdramaverse-api.domain.com/api';

// API Base URL
const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    user: '/auth/user',
  },
  
  // Drama Series
  dramaSeries: {
    all: '/drama-series',
    detail: (id: number) => `/drama-series/${id}`,
    search: (query: string) => `/drama-series/search?q=${encodeURIComponent(query)}`,
    byGenre: (genre: string) => `/drama-series/genre/${encodeURIComponent(genre)}`,
    byId: '/drama-series',
  },
  
  // Episodes
  episodes: {
    bySeriesId: (seriesId: number) => `/episodes/series/${seriesId}`,
    detail: (id: number) => `/episodes/${id}`,
    bySeries: '/episodes/series',
  },
  
  // Watchlist
  watchlist: {
    user: '/watchlist',
    add: '/watchlist/add',
    remove: '/watchlist/remove',
    check: '/watchlist/check',
  },
  
  // Watch History
  watchHistory: {
    user: '/watch-history',
    add: '/watch-history/add',
    update: '/watch-history/update',
  },
  
  // Ratings
  ratings: {
    bySeries: (seriesId: number) => `/ratings/series/${seriesId}`,
    add: '/ratings/add',
    update: '/ratings/update',
    delete: '/ratings/delete',
  },
  
  // Transactions
  transactions: {
    user: '/transactions',
    purchase: '/transactions/purchase',
  },
  
  // Advertisements
  advertisements: {
    active: (placement: string) => `/advertisements/${placement}`,
    impression: (id: number) => `/advertisements/${id}/impression`,
    click: (id: number) => `/advertisements/${id}/click`,
  },
};

// API Request Options
interface RequestOptions {
  headers?: Record<string, string>;
  authRequired?: boolean;
}

// Error handling
const handleApiError = async (response: Response): Promise<ApiError> => {
  try {
    const errorData = await response.json();
    return {
      message: errorData.message || 'An error occurred',
      status: response.status,
      details: errorData.details,
    };
  } catch (error) {
    return {
      message: 'An unknown error occurred',
      status: response.status,
    };
  }
};

// API Methods
const api = {
  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  },
  
  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  },
  
  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  },
  
  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  },
  
  /**
   * Generic request method
   */
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const { headers = {}, authRequired = true } = options;
    const url = `${API_URL}${endpoint}`;
    
    // Set headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Platform': Platform.OS,
      'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
      ...headers,
    };
    
    // Add auth token if required
    if (authRequired) {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
    
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      // Check for 401 Unauthorized
      if (response.status === 401) {
        // Remove token and throw error
        await removeToken();
        throw {
          message: 'Your session has expired. Please log in again.',
          status: 401,
        };
      }
      
      // Check if response is ok
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      
      // Parse response
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        // No content
        return {} as T;
      }
      
      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw {
          message: 'Request was aborted',
          status: 0,
        };
      }
      
      if ((error as Error).name === 'TypeError' && (error as Error).message.includes('Network request failed')) {
        throw {
          message: 'Network error. Please check your internet connection.',
          status: 0,
        };
      }
      
      throw error;
    }
  },
};

export default api;