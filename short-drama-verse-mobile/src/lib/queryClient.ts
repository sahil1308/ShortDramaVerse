import React from 'react';
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import api from '@/services/api';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

// Error handler
export function handleError(error: any) {
  if (error.status === 401) {
    // Unauthorized - trigger logout or redirect to login
    return;
  }

  // Display user-friendly error message
  const errorMessage = error.message || 'An unexpected error occurred';
  Alert.alert('Error', errorMessage);
}

/**
 * Default query function for data fetching
 * Handles authentication and error handling
 */
export const defaultQueryFn = async ({ queryKey }: { queryKey: string[] }) => {
  try {
    // Use the first element of the query key as the endpoint
    const endpoint = queryKey[0];
    
    // Get additional params from the rest of the queryKey if needed
    const response = await api.request('GET', endpoint);
    return response;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Helper function for handling API errors
 */
export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const data = axiosError.response.data as any;
      return data.message || 'Server error';
    }
    if (axiosError.request) {
      return 'Network error. Please check your connection.';
    }
  }
  return 'An unexpected error occurred';
}

/**
 * Custom hook for querying with automatic error handling
 */
export function useSafeQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError, TData, any>
) {
  return useQuery<TData, TError>({
    ...options,
    onError: (error) => {
      handleError(error);
      if (options.onError) {
        options.onError(error);
      }
    },
  });
}

/**
 * Custom hook for mutations with automatic error handling
 */
export function useSafeMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onError: (error, variables, context) => {
      handleError(error);
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
  });
}

/**
 * React Query Provider component
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}