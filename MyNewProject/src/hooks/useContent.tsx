/**
 * Content Hooks
 * 
 * Collection of hooks for accessing content data from the API.
 */
import { useState, useEffect, useCallback } from 'react';
import { contentService } from '../services/content';
import { 
  DramaSeries, 
  Episode, 
  Genre, 
  SearchResult,
  WatchHistoryEntry,
  WatchlistItem
} from '../types/content';
import { useAnonymousUser } from './useAnonymousUser';

// Series list hook
export function useSeriesList(options = {}) {
  const [series, setSeries] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchSeries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getAllSeries(options);
      setSeries(data);
    } catch (err) {
      console.error('Error fetching series list:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch series'));
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);
  
  return {
    data: series,
    isLoading,
    error,
    refresh: fetchSeries
  };
}

// Series detail hook
export function useSeries(id: number, includeEpisodes = true) {
  const [series, setSeries] = useState<DramaSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchSeries = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getSeriesById(id, includeEpisodes);
      setSeries(data);
    } catch (err) {
      console.error(`Error fetching series ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch series ${id}`));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeEpisodes]);
  
  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);
  
  return {
    data: series,
    isLoading,
    error,
    refresh: fetchSeries
  };
}

// Episodes hook
export function useEpisodes(seriesId: number) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchEpisodes = useCallback(async () => {
    if (!seriesId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getEpisodesBySeries(seriesId);
      setEpisodes(data);
    } catch (err) {
      console.error(`Error fetching episodes for series ${seriesId}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch episodes for series ${seriesId}`));
    } finally {
      setIsLoading(false);
    }
  }, [seriesId]);
  
  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);
  
  return {
    data: episodes,
    isLoading,
    error,
    refresh: fetchEpisodes
  };
}

// Episode detail hook
export function useEpisode(id: number) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchEpisode = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getEpisodeById(id);
      setEpisode(data);
    } catch (err) {
      console.error(`Error fetching episode ${id}:`, err);
      setError(err instanceof Error ? err : new Error(`Failed to fetch episode ${id}`));
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchEpisode();
  }, [fetchEpisode]);
  
  return {
    data: episode,
    isLoading,
    error,
    refresh: fetchEpisode
  };
}

// Genres hook
export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchGenres = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getAllGenres();
      setGenres(data);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch genres'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);
  
  return {
    data: genres,
    isLoading,
    error,
    refresh: fetchGenres
  };
}

// Trending content hook
export function useTrending(limit = 10) {
  const [trending, setTrending] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTrending = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getTrendingContent(limit);
      setTrending(data);
    } catch (err) {
      console.error('Error fetching trending content:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch trending content'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);
  
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);
  
  return {
    data: trending,
    isLoading,
    error,
    refresh: fetchTrending
  };
}

// New releases hook
export function useNewReleases(limit = 10) {
  const [newReleases, setNewReleases] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchNewReleases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getNewReleases(limit);
      setNewReleases(data);
    } catch (err) {
      console.error('Error fetching new releases:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch new releases'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);
  
  useEffect(() => {
    fetchNewReleases();
  }, [fetchNewReleases]);
  
  return {
    data: newReleases,
    isLoading,
    error,
    refresh: fetchNewReleases
  };
}

// Search hook
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const search = useCallback(async (searchQuery: string, options = {}) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setQuery(searchQuery);
      
      const data = await contentService.searchContent(searchQuery, options);
      setResults(data);
    } catch (err) {
      console.error(`Error searching for "${searchQuery}":`, err);
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    query,
    results,
    isLoading,
    error,
    search
  };
}

// Watch history hook
export function useWatchHistory(limit = 20) {
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAnonymousUser();
  
  const fetchWatchHistory = useCallback(async () => {
    // Don't fetch if user isn't authenticated
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getWatchHistory(limit);
      setHistory(data);
    } catch (err) {
      console.error('Error fetching watch history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch watch history'));
    } finally {
      setIsLoading(false);
    }
  }, [user, limit]);
  
  useEffect(() => {
    fetchWatchHistory();
  }, [fetchWatchHistory]);
  
  // Function to record watch progress
  const recordProgress = useCallback(async (
    contentId: number, 
    contentType: 'series' | 'episode',
    progress: number,
    position: number,
    completed = false
  ) => {
    if (!user) return;
    
    try {
      await contentService.recordWatchProgress(
        contentId,
        contentType,
        progress,
        position,
        completed
      );
      
      // Refresh history
      fetchWatchHistory();
    } catch (err) {
      console.error('Error recording watch progress:', err);
      throw err;
    }
  }, [user, fetchWatchHistory]);
  
  return {
    data: history,
    isLoading,
    error,
    refresh: fetchWatchHistory,
    recordProgress
  };
}

// Watchlist hook
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAnonymousUser();
  
  const fetchWatchlist = useCallback(async () => {
    // Don't fetch if user isn't authenticated
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await contentService.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch watchlist'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);
  
  // Function to add to watchlist
  const addToWatchlist = useCallback(async (
    contentId: number, 
    contentType: 'series' | 'episode',
    note?: string
  ) => {
    if (!user) return;
    
    try {
      await contentService.addToWatchlist(contentId, contentType, note);
      
      // Refresh watchlist
      fetchWatchlist();
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  }, [user, fetchWatchlist]);
  
  // Function to remove from watchlist
  const removeFromWatchlist = useCallback(async (
    contentId: number, 
    contentType: 'series' | 'episode'
  ) => {
    if (!user) return;
    
    try {
      await contentService.removeFromWatchlist(contentId, contentType);
      
      // Refresh watchlist
      fetchWatchlist();
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      throw err;
    }
  }, [user, fetchWatchlist]);
  
  // Check if content is in watchlist
  const isInWatchlist = useCallback((
    contentId: number, 
    contentType: 'series' | 'episode'
  ) => {
    return watchlist.some(
      item => item.contentId === contentId && item.contentType === contentType
    );
  }, [watchlist]);
  
  return {
    data: watchlist,
    isLoading,
    error,
    refresh: fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
}

// Main content hook that combines all functionality
export function useContent() {
  const { user } = useAnonymousUser();

  // Get dramas by genre
  const getDramasByGenre = useCallback(async (genre: string): Promise<DramaSeries[]> => {
    try {
      return await contentService.getSeriesByGenre(genre);
    } catch (error) {
      console.error('Error fetching dramas by genre:', error);
      throw error;
    }
  }, []);

  // Get trending dramas
  const getTrendingDramas = useCallback(async (limit = 20): Promise<DramaSeries[]> => {
    try {
      return await contentService.getTrendingContent(limit);
    } catch (error) {
      console.error('Error fetching trending dramas:', error);
      throw error;
    }
  }, []);

  // Get new releases
  const getNewReleases = useCallback(async (limit = 20): Promise<DramaSeries[]> => {
    try {
      return await contentService.getNewReleases(limit);
    } catch (error) {
      console.error('Error fetching new releases:', error);
      throw error;
    }
  }, []);

  // Get popular dramas
  const getPopularDramas = useCallback(async (limit = 20): Promise<DramaSeries[]> => {
    try {
      return await contentService.getPopularContent(limit);
    } catch (error) {
      console.error('Error fetching popular dramas:', error);
      throw error;
    }
  }, []);

  // Search dramas
  const searchDramas = useCallback(async (query: string): Promise<DramaSeries[]> => {
    try {
      const results = await contentService.searchContent(query);
      return results.map(result => result.series).filter(Boolean);
    } catch (error) {
      console.error('Error searching dramas:', error);
      throw error;
    }
  }, []);

  // Search dramas by title
  const searchDramasByTitle = useCallback(async (title: string): Promise<DramaSeries[]> => {
    try {
      return await contentService.searchSeriesByTitle(title);
    } catch (error) {
      console.error('Error searching dramas by title:', error);
      throw error;
    }
  }, []);

  // Search dramas by genre
  const searchDramasByGenre = useCallback(async (genre: string): Promise<DramaSeries[]> => {
    try {
      return await contentService.getSeriesByGenre(genre);
    } catch (error) {
      console.error('Error searching dramas by genre:', error);
      throw error;
    }
  }, []);

  // Search dramas by actor
  const searchDramasByActor = useCallback(async (actor: string): Promise<DramaSeries[]> => {
    try {
      return await contentService.searchSeriesByActor(actor);
    } catch (error) {
      console.error('Error searching dramas by actor:', error);
      throw error;
    }
  }, []);

  // Add to watch history
  const addToWatchHistory = useCallback(async (data: {
    drama_id: number;
    episode_id: number;
    watch_time: number;
    completed: boolean;
  }) => {
    if (!user) return;
    
    try {
      await contentService.recordWatchProgress(
        data.episode_id,
        'episode',
        data.completed ? 100 : (data.watch_time / 1800) * 100, // Assuming 30min episodes
        data.watch_time,
        data.completed
      );
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  }, [user]);

  return {
    getDramasByGenre,
    getTrendingDramas,
    getNewReleases,
    getPopularDramas,
    searchDramas,
    searchDramasByTitle,
    searchDramasByGenre,
    searchDramasByActor,
    addToWatchHistory
  };
}