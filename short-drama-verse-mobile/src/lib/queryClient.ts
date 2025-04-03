import { 
  QueryClient, 
  QueryClientProvider as TanstackQueryClientProvider,
  QueryOptions,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ApiError } from '@/types/drama';
import React from 'react';

// Create a client with default configurations
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

// Utility to make API requests
interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// Generic API request function that works with the API service
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await axios({
      method,
      url,
      data,
      ...config,
    });
    
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Format error message
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      const apiError: ApiError = {
        message,
        status,
        errors: error.response.data?.errors,
      };
      
      // For auth errors, may need to handle token refresh or logout
      if (status === 401) {
        // Clear stored token
        try {
          await AsyncStorage.removeItem('auth_token');
        } catch (storageError) {
          console.error('Failed to clear token:', storageError);
        }
      }
      
      // Show error on mobile devices
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Error',
          message,
          [{ text: 'OK' }]
        );
      }
      
      throw apiError;
    }
    
    // Handle non-axios errors
    const genericError = error as Error;
    throw {
      message: genericError.message || 'An unexpected error occurred',
      status: 500,
    };
  }
}

// Query context provider component
export const QueryClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};