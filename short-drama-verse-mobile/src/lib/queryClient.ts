/**
 * Query Client Configuration
 * 
 * Sets up the React Query client with custom configurations.
 * Provides utility functions for API requests.
 */
import { QueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';

/**
 * Custom QueryClient instance
 * 
 * Configured with default options for caching, retries and error handling
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

/**
 * API Request Types
 */
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Type for QueryFn options
 */
interface QueryFnOptions {
  on401?: 'throw' | 'returnNull';
  on404?: 'throw' | 'returnNull';
  baseUrl?: string;
}

/**
 * Type for API Request
 */
interface ApiRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

/**
 * Makes an API request using the apiService
 * 
 * @param method HTTP method
 * @param endpoint API endpoint
 * @param data Request body (for POST, PUT, PATCH)
 * @param options Additional options
 * @returns Promise with response data
 */
export const apiRequest = async <T>(
  method: ApiMethod,
  endpoint: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<T> => {
  try {
    let response: T;

    switch (method) {
      case 'GET':
        response = await apiService.get<T>(endpoint, data, options);
        break;
      case 'POST':
        response = await apiService.post<T>(endpoint, data, options);
        break;
      case 'PUT':
        response = await apiService.put<T>(endpoint, data, options);
        break;
      case 'PATCH':
        response = await apiService.patch<T>(endpoint, data, options);
        break;
      case 'DELETE':
        response = await apiService.delete<T>(endpoint, options);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response;
  } catch (error) {
    console.error(`API Request Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Creates a queryFn for React Query
 * 
 * @param options Query function options
 * @returns Query function
 */
export const getQueryFn = (options: QueryFnOptions = {}) => {
  return async ({ queryKey }: { queryKey: (string | Record<string, any>)[] }) => {
    const endpoint = queryKey[0] as string;
    
    // Extract params if they exist in the query key
    const params = queryKey.length > 1 && typeof queryKey[1] === 'object' ? queryKey[1] : undefined;
    
    try {
      return await apiRequest<any>('GET', endpoint, params, {
        baseUrl: options.baseUrl,
      });
    } catch (error: any) {
      // Handle specific error cases
      if (error.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      
      if (error.status === 404 && options.on404 === 'returnNull') {
        return null;
      }
      
      throw error;
    }
  };
};

/**
 * Pre-configured query keys for common API endpoints
 */
export const queryKeys = {
  user: {
    profile: ['/api/user'],
    stats: ['/api/user/stats'],
    watchlist: ['/api/watchlist'],
    watchHistory: ['/api/history'],
    transactions: ['/api/transactions'],
  },
  series: {
    all: ['/api/series'],
    trending: ['/api/series/trending'],
    recommended: ['/api/series/recommended'],
    popular: ['/api/series/popular'],
    recent: ['/api/series/recent'],
    details: (id: number | string) => ['/api/series', { id }],
    episodes: (id: number | string) => [`/api/series/${id}/episodes`],
  },
  episodes: {
    details: (id: number | string) => [`/api/episodes/${id}`],
    related: (id: number | string) => [`/api/episodes/${id}/related`],
    comments: (id: number | string) => [`/api/episodes/${id}/comments`],
  },
  analytics: {
    user: ['/api/analytics/user'],
    content: (id: number | string, type: 'series' | 'episode') => ['/api/analytics/content', { id, type }],
    admin: ['/api/analytics/admin'],
    trends: (timeframe: 'day' | 'week' | 'month' = 'week') => ['/api/analytics/trends', { timeframe }],
  },
};