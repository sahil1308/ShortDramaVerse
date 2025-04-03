import { 
  QueryClient, 
  QueryKey,
  useMutation, 
  UseMutationOptions,
  type MutationFunction
} from '@tanstack/react-query';
import axios, { AxiosError, Method } from 'axios';
import { api } from '@/services/api';

// Define query keys to avoid string duplications
export const queryKeys = {
  auth: {
    user: 'auth-user',
    profile: 'auth-profile',
  },
  series: {
    list: 'series-list',
    byId: (id: number) => `series-${id}`,
    popular: 'series-popular',
    trending: 'series-trending',
    byGenre: (genre: string) => `series-genre-${genre}`,
    search: (query: string) => `series-search-${query}`,
  },
  episodes: {
    bySeriesId: (seriesId: number) => `episodes-series-${seriesId}`,
    byId: (id: number) => `episode-${id}`,
    watchHistory: (episodeId: number) => `episode-${episodeId}-history`,
  },
  watchlist: {
    user: 'user-watchlist',
    check: (seriesId: number) => `watchlist-check-${seriesId}`,
  },
  watchHistory: {
    recent: 'watch-history-recent',
    all: 'watch-history-all',
  },
  ratings: {
    bySeriesId: (seriesId: number) => `ratings-series-${seriesId}`,
    userRating: (seriesId: number) => `rating-user-series-${seriesId}`,
  },
  transactions: {
    recent: 'transactions-recent',
    all: 'transactions-all',
  },
  user: {
    profile: 'user-profile',
    stats: 'user-stats',
  },
};

// Create shared Query Client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

/**
 * Make API request with proper error handling
 * @param method HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param url API endpoint URL
 * @param data Request body data (for POST, PUT, PATCH)
 * @returns Promise resolving to API response
 */
export const apiRequest = async <T = any>(
  method: Method,
  url: string,
  data?: any
): Promise<T> => {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'An error occurred during the request'
      );
    }
    throw error;
  }
};

/**
 * Custom hook for mutations with standard error handling and feedback
 * @param mutationFn Function that performs the mutation
 * @param options Additional options for the mutation
 * @returns Mutation result and functions
 */
export function useApiMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

// Prefetching helper functions
export const prefetchSeriesDetails = async (id: number) => {
  await queryClient.prefetchQuery({ 
    queryKey: [queryKeys.series.byId(id)], 
    queryFn: () => apiRequest('GET', `/api/series/${id}`) 
  });
};

export const prefetchSeriesList = async () => {
  await queryClient.prefetchQuery({ 
    queryKey: [queryKeys.series.list], 
    queryFn: () => apiRequest('GET', '/api/series') 
  });
};

export const prefetchEpisodes = async (seriesId: number) => {
  await queryClient.prefetchQuery({ 
    queryKey: [queryKeys.episodes.bySeriesId(seriesId)], 
    queryFn: () => apiRequest('GET', `/api/series/${seriesId}/episodes`) 
  });
};

// Cache invalidation helpers
export const invalidateSeriesQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: [queryKeys.series.list] });
};

export const invalidateEpisodeQueries = async (seriesId: number) => {
  await queryClient.invalidateQueries({ queryKey: [queryKeys.episodes.bySeriesId(seriesId)] });
};

export const invalidateWatchlistQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: [queryKeys.watchlist.user] });
};

export const invalidateUserQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: [queryKeys.user.profile] });
};

export default queryClient;