/**
 * Content Service
 * 
 * This service handles content-related data fetching and caching.
 * It interacts with the API to get drama series, episodes, and other content.
 */
import { apiService } from './api';
import { analyticsService } from './analytics';
import { AnalyticsEventType } from './analytics';
import { storageService } from './storage';
import { 
  DramaSeries, 
  Episode, 
  Genre, 
  WatchHistoryEntry,
  UserRating,
  WatchlistItem,
  Creator
} from '@/types/content';

// Content fetch options
export interface ContentFetchOptions {
  forceFresh?: boolean;
  cacheTTL?: number;
  mockOffline?: boolean;
}

// Default cache times
const CACHE_TIMES = {
  series: 60 * 60 * 1000, // 1 hour
  episodes: 30 * 60 * 1000, // 30 minutes
  genres: 24 * 60 * 60 * 1000, // 24 hours
  trending: 15 * 60 * 1000, // 15 minutes
  search: 5 * 60 * 1000, // 5 minutes
  watchHistory: 5 * 60 * 1000 // 5 minutes
};

// Endpoints
const ENDPOINTS = {
  series: '/series',
  episodes: '/episodes',
  genres: '/genres',
  trending: '/content/trending',
  popular: '/content/popular',
  newReleases: '/content/new-releases',
  watchHistory: '/user/watch-history',
  watchlist: '/user/watchlist',
  ratings: '/ratings',
  search: '/search',
  creators: '/creators'
};

// Filter options interface
export interface SeriesFilterOptions {
  genre?: string;
  language?: string;
  country?: string;
  releaseYear?: number;
  duration?: number;
  isFree?: boolean;
  isComplete?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'popularity' | 'releaseDate' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Mock database for development and offline use
const MOCK_DB = {
  series: [] as DramaSeries[],
  episodes: [] as Episode[],
  genres: [] as Genre[],
  watchHistory: [] as WatchHistoryEntry[],
  ratings: [] as UserRating[],
  watchlist: [] as WatchlistItem[],
  creators: [] as Creator[]
};

// Flag to indicate if mock data has been loaded
let mockDataLoaded = false;

class ContentService {
  /**
   * Load mock data for development and testing
   */
  private async loadMockData(): Promise<void> {
    if (mockDataLoaded) return;
    
    try {
      // Try to load mock data from storage first
      const storedData = await storageService.getJsonItem<typeof MOCK_DB>('mock_content_data');
      
      if (storedData) {
        Object.assign(MOCK_DB, storedData);
        mockDataLoaded = true;
        return;
      }
      
      // Generate mock data if not available in storage
      // This will be implemented in the generateMockData function for development
      this.generateMockData();
      mockDataLoaded = true;
      
      // Store mock data for future use
      await storageService.setJsonItem('mock_content_data', MOCK_DB);
    } catch (error) {
      console.error('Error loading mock data:', error);
      this.generateMockData();
    }
  }
  
  /**
   * Generate mock data for development and testing
   */
  private generateMockData(): void {
    // Create genres
    const genres: Genre[] = [
      { id: 'romance', name: 'Romance', description: 'Love stories focused on relationships', seriesCount: 25 },
      { id: 'comedy', name: 'Comedy', description: 'Light-hearted stories with humor', seriesCount: 30 },
      { id: 'drama', name: 'Drama', description: 'Serious, character-driven narratives', seriesCount: 40 },
      { id: 'thriller', name: 'Thriller', description: 'Suspenseful, exciting stories', seriesCount: 20 },
      { id: 'mystery', name: 'Mystery', description: 'Stories focused on solving puzzles or crimes', seriesCount: 15 },
      { id: 'action', name: 'Action', description: 'Fast-paced stories with physical challenges', seriesCount: 18 },
      { id: 'fantasy', name: 'Fantasy', description: 'Stories with magical or supernatural elements', seriesCount: 12 },
      { id: 'historical', name: 'Historical', description: 'Stories set in the past', seriesCount: 10 },
      { id: 'slice-of-life', name: 'Slice of Life', description: 'Realistic portrayal of everyday life', seriesCount: 22 },
      { id: 'melodrama', name: 'Melodrama', description: 'Emotionally intense dramas', seriesCount: 28 }
    ];
    
    // Create creators (actors, directors)
    const creators: Creator[] = [];
    for (let i = 1; i <= 30; i++) {
      creators.push({
        id: i,
        name: `Creator ${i}`,
        role: i % 2 === 0 ? 'actor' : 'director',
        profileImage: `https://via.placeholder.com/150?text=Creator+${i}`,
        series: []
      });
    }
    
    // Create series
    const series: DramaSeries[] = [];
    for (let i = 1; i <= 50; i++) {
      // Assign random genres (1-3 per series)
      const seriesGenres = this.shuffleArray([...genres])
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map((g: Genre) => g.name);
      
      // Assign random creators (2-5 per series)
      const seriesCreators = this.shuffleArray([...creators])
        .slice(0, Math.floor(Math.random() * 4) + 2);
      
      const seriesActors = seriesCreators
        .filter((c: Creator) => c.role === 'actor')
        .map((c: Creator) => c.name);
      
      const seriesDirectors = seriesCreators
        .filter((c: Creator) => c.role === 'director')
        .map((c: Creator) => c.name);
      
      // Update creator's series list
      seriesCreators.forEach((creator: Creator) => {
        if (!creator.series) creator.series = [];
        creator.series.push(i);
      });
      
      // Create a series with unique ID
      series.push({
        id: i,
        title: `Drama Series ${i}`,
        description: `This is the description for drama series ${i}. It has an engaging storyline that will keep you hooked from start to finish.`,
        coverImage: `https://via.placeholder.com/300x450?text=Series+${i}`,
        bannerImage: `https://via.placeholder.com/1200x400?text=Series+${i}+Banner`,
        trailerUrl: `https://example.com/trailers/series-${i}`,
        genres: seriesGenres,
        releaseYear: Math.floor(Math.random() * 5) + 2018, // 2018-2023
        totalEpisodes: Math.floor(Math.random() * 12) + 5, // 5-16 episodes
        averageEpisodeDuration: [15, 20, 30, 45, 60][Math.floor(Math.random() * 5)], // Random duration
        language: ['Korean', 'Japanese', 'Chinese', 'Thai', 'English'][Math.floor(Math.random() * 5)],
        country: ['South Korea', 'Japan', 'China', 'Thailand', 'USA'][Math.floor(Math.random() * 5)],
        maturityRating: ['G', 'PG', 'PG-13', 'R'][Math.floor(Math.random() * 4)],
        isComplete: Math.random() > 0.3, // 70% complete
        isPremium: Math.random() > 0.7, // 30% premium
        averageRating: Math.floor(Math.random() * 40 + 30) / 10, // 3.0-7.0
        viewCount: Math.floor(Math.random() * 1000000),
        actors: seriesActors,
        directors: seriesDirectors,
        writers: [`Writer ${Math.floor(Math.random() * 20) + 1}`],
        themes: ['Love', 'Friendship', 'Betrayal', 'Redemption', 'Family']
          .slice(0, Math.floor(Math.random() * 3) + 1),
        keywords: ['Emotional', 'Suspenseful', 'Heartwarming', 'Thought-provoking']
          .slice(0, Math.floor(Math.random() * 3) + 1),
        tone: ['light-hearted', 'dark', 'inspirational', 'suspenseful'][Math.floor(Math.random() * 4)],
        subscriptionRequired: Math.random() > 0.7,
        coinPrice: Math.random() > 0.7 ? Math.floor(Math.random() * 10) * 100 + 100 : undefined,
        createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Within last year
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Create episodes for each series
    const episodes: Episode[] = [];
    let episodeId = 1;
    
    series.forEach(s => {
      const episodeCount = s.totalEpisodes;
      
      for (let i = 1; i <= episodeCount; i++) {
        episodes.push({
          id: episodeId++,
          seriesId: s.id,
          title: `${s.title} - Episode ${i}`,
          description: `Episode ${i} of ${s.title}. ${
            i === 1 ? 'The story begins...' : 
            i === episodeCount ? 'The finale episode!' : 
            'The story continues...'
          }`,
          thumbnailImage: `https://via.placeholder.com/400x225?text=S${s.id}E${i}`,
          episodeNumber: i,
          seasonNumber: 1,
          duration: s.averageEpisodeDuration + Math.floor(Math.random() * 10) - 5, // +/- 5 minutes
          videoUrl: `https://example.com/videos/series-${s.id}/episode-${i}`,
          videoUrlHd: `https://example.com/videos/series-${s.id}/episode-${i}/hd`,
          releaseDate: new Date(
            Date.now() - (episodeCount - i + 1) * 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // Weekly releases
          isPremium: s.isPremium && (i > Math.min(3, Math.floor(episodeCount * 0.3))), // First few episodes free
          hasFreePreview: s.isPremium && i > 3 && Math.random() > 0.5,
          previewDuration: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
          viewCount: Math.floor(Math.random() * 500000),
          subscriptionRequired: s.subscriptionRequired && i > 3,
          coinPrice: s.coinPrice && i > 3 ? s.coinPrice - 100 : undefined,
          createdAt: new Date(Date.now() - (episodeCount - i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      // Add episodes to series
      s.episodes = episodes.filter(e => e.seriesId === s.id);
    });
    
    // Update MOCK_DB
    MOCK_DB.series = series;
    MOCK_DB.episodes = episodes;
    MOCK_DB.genres = genres;
    MOCK_DB.creators = creators;
  }
  
  /**
   * Get all drama series
   */
  async getAllSeries(
    options: SeriesFilterOptions = {},
    fetchOptions: ContentFetchOptions = {}
  ): Promise<DramaSeries[]> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        let results = [...MOCK_DB.series];
        
        // Apply filters
        if (options.genre) {
          results = results.filter(s => s.genres.includes(options.genre!));
        }
        
        if (options.language) {
          results = results.filter(s => s.language === options.language);
        }
        
        if (options.country) {
          results = results.filter(s => s.country === options.country);
        }
        
        if (options.releaseYear) {
          results = results.filter(s => s.releaseYear === options.releaseYear);
        }
        
        if (options.isFree !== undefined) {
          results = results.filter(s => !s.isPremium === options.isFree);
        }
        
        if (options.isComplete !== undefined) {
          results = results.filter(s => s.isComplete === options.isComplete);
        }
        
        // Apply sorting
        if (options.sortBy) {
          const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
          
          switch (options.sortBy) {
            case 'popularity':
              results.sort((a, b) => sortOrder * ((b.viewCount || 0) - (a.viewCount || 0)));
              break;
            case 'releaseDate':
              results.sort((a, b) => sortOrder * (b.releaseYear - a.releaseYear));
              break;
            case 'rating':
              results.sort((a, b) => sortOrder * ((b.averageRating || 0) - (a.averageRating || 0)));
              break;
          }
        }
        
        // Apply pagination
        const page = options.page || 1;
        const limit = options.limit || results.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        
        return results.slice(start, end);
      }
      
      // Convert options to proper type for apiService
      const queryParams: Record<string, string | number | boolean> = {};
      
      // Add only defined properties to queryParams
      if (options.genre) queryParams.genre = options.genre;
      if (options.language) queryParams.language = options.language;
      if (options.country) queryParams.country = options.country;
      if (options.releaseYear) queryParams.releaseYear = options.releaseYear;
      if (options.isFree !== undefined) queryParams.isFree = options.isFree;
      if (options.isComplete !== undefined) queryParams.isComplete = options.isComplete;
      if (options.page) queryParams.page = options.page;
      if (options.limit) queryParams.limit = options.limit;
      if (options.sortBy) queryParams.sortBy = options.sortBy;
      if (options.sortOrder) queryParams.sortOrder = options.sortOrder;
      
      // Real API implementation
      return await apiService.get<DramaSeries[]>(ENDPOINTS.series, queryParams, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.series
      });
    } catch (error) {
      console.error('Error fetching series:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getAllSeries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      return MOCK_DB.series;
    }
  }
  
  /**
   * Get a single drama series by ID
   */
  async getSeriesById(
    id: number,
    includeEpisodes: boolean = true,
    fetchOptions: ContentFetchOptions = {}
  ): Promise<DramaSeries | null> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        const series = MOCK_DB.series.find(s => s.id === id);
        
        if (!series) {
          return null;
        }
        
        // Include episodes if requested
        if (includeEpisodes) {
          series.episodes = MOCK_DB.episodes.filter(e => e.seriesId === id);
        }
        
        return series;
      }
      
      // Real API implementation
      return await apiService.get<DramaSeries>(`${ENDPOINTS.series}/${id}`, 
        { includeEpisodes },
        {
          skipCache: fetchOptions.forceFresh,
          cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.series
        }
      );
    } catch (error) {
      console.error(`Error fetching series ${id}:`, error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getSeriesById',
        seriesId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      const series = MOCK_DB.series.find(s => s.id === id) || null;
      
      if (series && includeEpisodes) {
        series.episodes = MOCK_DB.episodes.filter(e => e.seriesId === id);
      }
      
      return series;
    }
  }
  
  /**
   * Get episodes for a series
   */
  async getEpisodesBySeries(
    seriesId: number,
    fetchOptions: ContentFetchOptions = {}
  ): Promise<Episode[]> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        return MOCK_DB.episodes.filter(e => e.seriesId === seriesId);
      }
      
      // Real API implementation
      return await apiService.get<Episode[]>(`${ENDPOINTS.series}/${seriesId}/episodes`, {}, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.episodes
      });
    } catch (error) {
      console.error(`Error fetching episodes for series ${seriesId}:`, error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getEpisodesBySeries',
        seriesId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      return MOCK_DB.episodes.filter(e => e.seriesId === seriesId);
    }
  }
  
  /**
   * Get a single episode by ID
   */
  async getEpisodeById(
    id: number,
    fetchOptions: ContentFetchOptions = {}
  ): Promise<Episode | null> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        return MOCK_DB.episodes.find(e => e.id === id) || null;
      }
      
      // Real API implementation
      return await apiService.get<Episode>(`${ENDPOINTS.episodes}/${id}`, {}, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.episodes
      });
    } catch (error) {
      console.error(`Error fetching episode ${id}:`, error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getEpisodeById',
        episodeId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      return MOCK_DB.episodes.find(e => e.id === id) || null;
    }
  }
  
  /**
   * Get all genres
   */
  async getAllGenres(
    fetchOptions: ContentFetchOptions = {}
  ): Promise<Genre[]> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        return MOCK_DB.genres;
      }
      
      // Real API implementation
      return await apiService.get<Genre[]>(ENDPOINTS.genres, {}, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.genres
      });
    } catch (error) {
      console.error('Error fetching genres:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getAllGenres',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      return MOCK_DB.genres;
    }
  }
  
  /**
   * Get trending content
   */
  async getTrendingContent(
    limit: number = 10,
    fetchOptions: ContentFetchOptions = {}
  ): Promise<DramaSeries[]> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        // Sort by view count to simulate trending
        return [...MOCK_DB.series]
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, limit);
      }
      
      // Real API implementation
      return await apiService.get<DramaSeries[]>(ENDPOINTS.trending, { limit }, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.trending
      });
    } catch (error) {
      console.error('Error fetching trending content:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getTrendingContent',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      return [...MOCK_DB.series]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, limit);
    }
  }
  
  /**
   * Get new releases
   */
  async getNewReleases(
    limit: number = 10,
    fetchOptions: ContentFetchOptions = {}
  ): Promise<DramaSeries[]> {
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        // Sort by creation date to simulate new releases
        return [...MOCK_DB.series]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      }
      
      // Real API implementation
      return await apiService.get<DramaSeries[]>(ENDPOINTS.newReleases, { limit }, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.trending
      });
    } catch (error) {
      console.error('Error fetching new releases:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getNewReleases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to mock data if API fails
      await this.loadMockData();
      return [...MOCK_DB.series]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }
  }
  
  /**
   * Search for content
   */
  async searchContent(
    query: string,
    options: {
      types?: ('series' | 'episode' | 'creator')[];
      limit?: number;
    } = {},
    fetchOptions: ContentFetchOptions = {}
  ): Promise<any[]> {
    if (!query.trim()) {
      return [];
    }
    
    try {
      if (fetchOptions.mockOffline) {
        await this.loadMockData();
        const results: any[] = [];
        const types = options.types || ['series', 'episode', 'creator'];
        const limit = options.limit || 20;
        const lowerQuery = query.toLowerCase();
        
        // Search series
        if (types.includes('series')) {
          const matchingSeries = MOCK_DB.series.filter(
            s => s.title.toLowerCase().includes(lowerQuery) || 
                 s.description.toLowerCase().includes(lowerQuery)
          );
          
          results.push(...matchingSeries.map(s => ({
            id: s.id,
            title: s.title,
            type: 'series',
            thumbnailImage: s.coverImage,
            description: s.description.substring(0, 100) + '...',
            score: s.title.toLowerCase().includes(lowerQuery) ? 1.0 : 0.7
          })));
        }
        
        // Search episodes
        if (types.includes('episode')) {
          const matchingEpisodes = MOCK_DB.episodes.filter(
            e => e.title.toLowerCase().includes(lowerQuery) || 
                 e.description.toLowerCase().includes(lowerQuery)
          );
          
          results.push(...matchingEpisodes.map(e => ({
            id: e.id,
            title: e.title,
            type: 'episode',
            thumbnailImage: e.thumbnailImage,
            description: e.description.substring(0, 100) + '...',
            score: e.title.toLowerCase().includes(lowerQuery) ? 0.9 : 0.6
          })));
        }
        
        // Search creators
        if (types.includes('creator')) {
          const matchingCreators = MOCK_DB.creators.filter(
            c => c.name.toLowerCase().includes(lowerQuery)
          );
          
          results.push(...matchingCreators.map(c => {
            // Create placeholder URL with proper encoding if no profile image exists
            const placeholderUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(c.name)}`;
            
            return {
              id: c.id,
              title: c.name,
              type: 'creator',
              thumbnailImage: c.profileImage || placeholderUrl,
              description: `${c.role.charAt(0).toUpperCase() + c.role.slice(1)} with ${c.series?.length || 0} series`,
              score: 0.8
            };
          }));
        }
        
        // Sort by score and limit results
        return results
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }
      
      // Real API implementation
      // Create proper query params without undefined values
      const queryParams: Record<string, string | number | boolean> = { q: query };
      
      if (options.types && options.types.length > 0) {
        queryParams.types = options.types.join(',');
      }
      
      if (options.limit) {
        queryParams.limit = options.limit;
      }
      
      return await apiService.get(ENDPOINTS.search, queryParams, {
        skipCache: fetchOptions.forceFresh,
        cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.search
      });
    } catch (error) {
      console.error(`Error searching for "${query}":`, error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'searchContent',
        query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to empty results if search fails
      return [];
    }
  }
  
  /**
   * Get user watch history
   */
  async getWatchHistory(
    limit: number = 20,
    fetchOptions: ContentFetchOptions = {}
  ): Promise<WatchHistoryEntry[]> {
    try {
      // Real API implementation
      return await apiService.get<WatchHistoryEntry[]>(
        ENDPOINTS.watchHistory, 
        { limit }, 
        {
          requireAuth: true,
          skipCache: fetchOptions.forceFresh,
          cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.watchHistory
        }
      );
    } catch (error) {
      console.error('Error fetching watch history:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getWatchHistory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return empty array if failed
      return [];
    }
  }
  
  /**
   * Record watch progress
   */
  async recordWatchProgress(
    contentId: number,
    contentType: 'series' | 'episode',
    progress: number,
    position: number,
    completed: boolean = false
  ): Promise<void> {
    try {
      // Track content view
      analyticsService.trackEvent(AnalyticsEventType.CONTENT_VIEW, {
        content_id: contentId,
        content_type: contentType,
        progress,
        position,
        completed
      });
      
      // Real API implementation
      await apiService.post(
        ENDPOINTS.watchHistory,
        {
          contentId,
          contentType,
          progress,
          position,
          completed
        },
        { requireAuth: true }
      );
    } catch (error) {
      console.error('Error recording watch progress:', error);
      
      // Track error but don't throw - this should be a background operation
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'recordWatchProgress',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Add to watchlist
   */
  async addToWatchlist(
    contentId: number,
    contentType: 'series' | 'episode',
    note?: string
  ): Promise<void> {
    try {
      // Track watchlist add
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'watchlist_add',
        content_id: contentId,
        content_type: contentType
      });
      
      // Real API implementation
      await apiService.post(
        ENDPOINTS.watchlist,
        {
          contentId,
          contentType,
          note
        },
        { requireAuth: true }
      );
      
      // Clear watchlist cache
      apiService.clearCacheForEndpoint(ENDPOINTS.watchlist);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'addToWatchlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Re-throw for UI handling
      throw error;
    }
  }
  
  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(
    contentId: number,
    contentType: 'series' | 'episode'
  ): Promise<void> {
    try {
      // Track watchlist remove
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'watchlist_remove',
        content_id: contentId,
        content_type: contentType
      });
      
      // Real API implementation
      await apiService.delete(
        `${ENDPOINTS.watchlist}/${contentType}/${contentId}`,
        { requireAuth: true }
      );
      
      // Clear watchlist cache
      apiService.clearCacheForEndpoint(ENDPOINTS.watchlist);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'removeFromWatchlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Re-throw for UI handling
      throw error;
    }
  }
  
  /**
   * Get user watchlist
   */
  async getWatchlist(
    fetchOptions: ContentFetchOptions = {}
  ): Promise<WatchlistItem[]> {
    try {
      // Real API implementation
      return await apiService.get<WatchlistItem[]>(
        ENDPOINTS.watchlist,
        {},
        {
          requireAuth: true,
          skipCache: fetchOptions.forceFresh,
          cacheTTL: fetchOptions.cacheTTL || CACHE_TIMES.watchHistory
        }
      );
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      
      // Track error
      analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
        feature: 'content',
        operation: 'getWatchlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return empty array if failed
      return [];
    }
  }
  
  /**
   * Helper function to shuffle array (for mock data)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

// Export singleton instance
export const contentService = new ContentService();