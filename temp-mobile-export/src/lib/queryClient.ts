import {
  QueryClient,
  QueryKey,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { apiRequest as apiRequestFn } from '@/services/api';
import React, { ReactNode } from 'react';
import { Alert } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

// Configure options for the query function
type QueryFnOptions = {
  on401?: 'throwError' | 'returnNull';
  headers?: Record<string, string>;
};

const defaultQueryFnOptions: QueryFnOptions = {
  on401: 'throwError',
  headers: {},
};

// Create a query function that can be used with useQuery
export const getQueryFn = (options: QueryFnOptions = defaultQueryFnOptions) => {
  return async ({ queryKey }: { queryKey: QueryKey }) => {
    try {
      const endpoint = queryKey[0] as string;
      const mergedOptions = { ...defaultQueryFnOptions, ...options };
      
      // Use apiRequest from the api.ts file
      return await apiRequestFn('GET', endpoint, undefined, mergedOptions.headers);
    } catch (error: any) {
      if (error.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      
      console.error('Query error:', error);
      throw error;
    }
  };
};

// Wrapper for apiRequest to be used with mutations
export const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  headers?: Record<string, string>
): Promise<T> => {
  try {
    // Use apiRequest from the api.ts file
    let response: T = await apiRequestFn(method, endpoint, data, headers);
    return response;
  } catch (error: any) {
    console.error(`API Request error (${method} ${endpoint}):`, error);
    
    // Show an alert for network errors or other issues
    if (!error.status || error.status >= 500) {
      Alert.alert(
        'Network Error',
        'There was a problem connecting to the server. Please check your internet connection and try again.'
      );
    }
    
    throw error;
  }
};

// Custom provider that provides the query client to the app
export const CustomQueryClientProvider: React.FC<{ children: ReactNode }> = ({ 
  children 
}) => {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};