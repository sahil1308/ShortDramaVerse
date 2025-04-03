import { getToken, removeToken } from '@/services/storage';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// API base URL and endpoints
const isDev = __DEV__;
const API_URL = isDev 
  ? 'http://localhost:3000/api' 
  : 'https://api.shortdramaverse.com/api';

// Define API endpoints
export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    user: '/auth/user',
  },
  drama: {
    all: '/dramas',
    get: (id: number) => `/dramas/${id}`,
    byGenre: (genre: string) => `/dramas/genre/${genre}`,
    search: (query: string) => `/dramas/search?q=${query}`,
    featured: '/dramas/featured',
    trending: '/dramas/trending',
    newest: '/dramas/newest',
  },
  episode: {
    all: (seriesId: number) => `/episodes/series/${seriesId}`,
    get: (id: number) => `/episodes/${id}`,
    purchase: '/episodes/purchase',
  },
  watchlist: {
    get: '/watchlist',
    add: '/watchlist/add',
    remove: (seriesId: number) => `/watchlist/${seriesId}`,
    check: (seriesId: number) => `/watchlist/check/${seriesId}`,
  },
  watchHistory: {
    get: '/watch-history',
    create: '/watch-history',
  },
  transaction: {
    get: '/transactions',
    create: '/transactions',
  },
  rating: {
    get: (seriesId: number) => `/ratings/series/${seriesId}`,
    create: '/ratings',
  },
  profile: {
    get: '/profile',
    update: '/profile',
  },
  coin: {
    balance: '/coins/balance',
    purchase: '/coins/purchase',
  },
  settings: {
    get: '/settings',
    update: '/settings',
  }
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Custom API error class
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Main API request function
export const apiRequest = async <T = any>(
  method: HttpMethod,
  endpoint: string,
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> => {
  try {
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-App-Version': Constants.expoConfig?.version || '1.0.0',
      'X-Platform': Platform.OS,
      ...customHeaders,
    };

    // Add authorization token if available
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    // Make the request
    const url = `${API_URL}${endpoint}`;
    console.log(`API ${method} request to: ${url}`);
    
    const response = await fetch(url, options);
    
    // If the response is 401 Unauthorized, clear the token
    if (response.status === 401) {
      // Token might be expired, remove it
      await removeToken();
    }

    // Parse the response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle unsuccessful response
    if (!response.ok) {
      const message = data?.message || response.statusText || 'Something went wrong';
      throw new ApiError(message, response.status, data);
    }

    return data as T;
  } catch (error) {
    // Rethrow ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new ApiError('Network request failed. Please check your internet connection.', 0);
    }

    // Handle other errors
    console.error('API request error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      0
    );
  }
};

// Convenience methods for different HTTP verbs
export const get = async <T = any>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> => {
  return apiRequest<T>('GET', endpoint, undefined, customHeaders);
};

export const post = async <T = any>(endpoint: string, body?: any, customHeaders?: Record<string, string>): Promise<T> => {
  return apiRequest<T>('POST', endpoint, body, customHeaders);
};

export const put = async <T = any>(endpoint: string, body?: any, customHeaders?: Record<string, string>): Promise<T> => {
  return apiRequest<T>('PUT', endpoint, body, customHeaders);
};

export const del = async <T = any>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> => {
  return apiRequest<T>('DELETE', endpoint, undefined, customHeaders);
};

export const patch = async <T = any>(endpoint: string, body?: any, customHeaders?: Record<string, string>): Promise<T> => {
  return apiRequest<T>('PATCH', endpoint, body, customHeaders);
};