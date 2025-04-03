import { QueryClient } from '@tanstack/react-query';
import { QueryCache, MutationCache } from '@tanstack/react-query';
import api from '@/services/api';
import { ApiError } from '@/types/drama';
import { getToken } from '@/services/storage';

// Options for apiRequest
interface ApiRequestOptions {
  authRequired?: boolean;
  headers?: Record<string, string>;
}

// Create a new queryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query error:', error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  }),
});

// Helper function to make API requests
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    if (method === 'GET') {
      return await api.get<T>(endpoint, options);
    } else if (method === 'POST') {
      return await api.post<T>(endpoint, data, options);
    } else if (method === 'PUT') {
      return await api.put<T>(endpoint, data, options);
    } else if (method === 'DELETE') {
      return await api.delete<T>(endpoint, options);
    }
    
    throw new Error(`Unsupported method: ${method}`);
  } catch (error) {
    console.error(`API ${method} request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Interface for default query function options
export interface QueryFnOptions {
  on401?: 'throw' | 'returnNull';
}

// Default query function
export const getQueryFn = (options: QueryFnOptions = {}) => {
  return async function queryFn<T>({ queryKey }: { queryKey: string[] }): Promise<T | null> {
    const endpoint = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    
    try {
      return await api.get<T>(endpoint);
    } catch (error) {
      const apiError = error as ApiError;
      
      // Handle unauthorized errors
      if (apiError.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      
      throw error;
    }
  };
};

// React Query Provider component
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Import this at the top of the file after all imports
import { QueryClientProvider } from '@tanstack/react-query';