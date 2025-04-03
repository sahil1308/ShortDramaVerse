import { QueryClient } from '@tanstack/react-query';

type QueryFnOptions = {
  on401?: 'returnNull' | 'throw';
};

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Default API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  headers?: HeadersInit
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok && response.status !== 401) {
    // Get error message from response
    let errorMessage = 'An unknown error occurred';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Ignore parsing errors
    }
    throw new Error(errorMessage);
  }

  return response;
}

// Custom queryFn that handles 401 responses
export function getQueryFn({ on401 = 'throw' }: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const url = queryKey[0];
    const response = await apiRequest('GET', url);

    if (response.status === 401) {
      if (on401 === 'returnNull') {
        return null;
      }
      // Get error message from response
      let errorMessage = 'You must be logged in to view this content';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Ignore parsing errors
      }
      throw new Error(errorMessage);
    }

    return response.json();
  };
}