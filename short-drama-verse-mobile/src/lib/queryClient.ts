import { 
  QueryClient, 
  UseMutationOptions, 
  UseQueryOptions 
} from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import api from '@/services/api';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

interface FetcherOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  on401?: 'returnNull' | 'reject';
}

/**
 * Basic API fetcher that handles common tasks
 */
export async function fetcher(
  url: string,
  options: FetcherOptions = {}
) {
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    signal,
    on401 = 'reject' 
  } = options;

  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        ...headers,
      },
      signal,
    };

    if (body) {
      config.data = body;
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (on401 === 'returnNull') {
        return null;
      }
    }
    
    // Re-throw error for the calling code to handle
    throw error;
  }
}

/**
 * Helper for creating API mutation options
 */
export function createMutationOptions<TData, TVariables>({
  url,
  method = 'POST',
  mutationFn,
  ...options
}: UseMutationOptions<TData, Error, TVariables> & {
  url?: string;
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}): UseMutationOptions<TData, Error, TVariables> {
  return {
    mutationFn: mutationFn || (async (variables: TVariables) => {
      try {
        return await fetcher(url!, {
          method,
          body: variables,
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error.response?.data?.message || error.message);
        }
        throw error;
      }
    }),
    ...options,
  };
}

/**
 * Default query function that the query client will use if none is provided
 */
export const defaultQueryFn = async ({ queryKey }: { queryKey: string | string[] }) => {
  const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
  return fetcher(url, { on401: 'reject' });
};