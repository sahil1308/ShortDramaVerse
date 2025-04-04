/**
 * Storage Service for ShortDramaVerse Mobile
 * 
 * This service provides a unified interface for storing and
 * retrieving data from AsyncStorage, with caching for
 * improved performance.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  DramaSeries, 
  Episode, 
  WatchHistory, 
  Download,
  UserSettings,
  WatchlistItem,
  UserPreferences,
  AppState
} from '@/types/drama';

// Storage keys enum
export enum StorageKey {
  // Auth
  AUTH_TOKEN = '@ShortDramaVerse:authToken',
  REFRESH_TOKEN = '@ShortDramaVerse:refreshToken',
  USER = '@ShortDramaVerse:user',
  
  // App state
  APP_STATE = '@ShortDramaVerse:appState',
  DEVICE_ID = '@ShortDramaVerse:deviceId',
  FIRST_LAUNCH = '@ShortDramaVerse:firstLaunch',
  ONBOARDING_COMPLETED = '@ShortDramaVerse:onboardingCompleted',
  
  // User data
  USER_SETTINGS = '@ShortDramaVerse:userSettings',
  USER_PREFERENCES = '@ShortDramaVerse:userPreferences',
  WATCH_HISTORY = '@ShortDramaVerse:watchHistory',
  WATCHLIST = '@ShortDramaVerse:watchlist',
  DOWNLOADS = '@ShortDramaVerse:downloads',
  
  // Content data
  SERIES_PREFIX = '@ShortDramaVerse:series:',
  EPISODE_PREFIX = '@ShortDramaVerse:episode:',
  RECENT_SERIES = '@ShortDramaVerse:recentSeries',
  TRENDING_SERIES = '@ShortDramaVerse:trendingSeries',
  RECOMMENDED_SERIES = '@ShortDramaVerse:recommendedSeries',
  
  // Cache
  CACHE_PREFIX = '@ShortDramaVerse:cache:',
  CACHE_EXPIRY_PREFIX = '@ShortDramaVerse:cacheExpiry:',
  
  // Analytics
  ANALYTICS_EVENTS = '@ShortDramaVerse:analyticsEvents',
  
  // Offline data
  OFFLINE_DATA_PREFIX = '@ShortDramaVerse:offline:',
}

// Default cache expiration (24 hours in milliseconds)
const DEFAULT_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * Storage Service class for managing local data storage
 */
class StorageService {
  // In-memory cache
  private memoryCache: Map<string, any> = new Map();
  
  constructor() {
    // Initialize
    this.init();
  }
  
  /**
   * Initialize storage service
   */
  private async init(): Promise<void> {
    try {
      // Check if app state exists
      const appStateJson = await AsyncStorage.getItem(StorageKey.APP_STATE);
      
      if (!appStateJson) {
        // Create initial app state
        const initialAppState: AppState = {
          isNetworkAvailable: true,
          lastSyncTime: null,
          appVersion: process.env.APP_VERSION || '1.0.0',
          isFirstLaunch: true,
          hasCompletedOnboarding: false,
          currentlyPlayingEpisode: null,
          appOpenCount: 0,
          deviceId: '',
          installedDate: new Date().toISOString(),
          lastUpdateDate: null,
        };
        
        // Save initial app state
        await this.setItem(StorageKey.APP_STATE, initialAppState);
      } else {
        // Load app state and update app open count
        const appState: AppState = JSON.parse(appStateJson);
        appState.appOpenCount += 1;
        await this.setItem(StorageKey.APP_STATE, appState);
      }
    } catch (error) {
      console.error('Error initializing storage service:', error);
    }
  }
  
  /**
   * Set item in storage
   * 
   * @param key - Storage key
   * @param value - Value to store
   */
  public async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      
      // Update memory cache
      this.memoryCache.set(key, value);
    } catch (error) {
      console.error(`Error setting item [${key}]:`, error);
      throw error;
    }
  }
  
  /**
   * Get item from storage
   * 
   * @param key - Storage key
   * @returns Stored value or null if not found
   */
  public async getItem<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key) as T;
      }
      
      // Get from AsyncStorage
      const jsonValue = await AsyncStorage.getItem(key);
      
      if (jsonValue !== null) {
        const value = JSON.parse(jsonValue) as T;
        
        // Update memory cache
        this.memoryCache.set(key, value);
        
        return value;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting item [${key}]:`, error);
      return null;
    }
  }
  
  /**
   * Remove item from storage
   * 
   * @param key - Storage key
   */
  public async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      
      // Remove from memory cache
      this.memoryCache.delete(key);
    } catch (error) {
      console.error(`Error removing item [${key}]:`, error);
      throw error;
    }
  }
  
  /**
   * Check if item exists in storage
   * 
   * @param key - Storage key
   * @returns True if item exists
   */
  public async hasItem(key: string): Promise<boolean> {
    try {
      // Check memory cache first
      if (this.memoryCache.has(key)) {
        return true;
      }
      
      // Check AsyncStorage
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking item [${key}]:`, error);
      return false;
    }
  }
  
  /**
   * Set cached item with expiration
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param expiry - Cache expiration in milliseconds (default: 24 hours)
   */
  public async setCachedItem(
    key: string,
    value: any,
    expiry: number = DEFAULT_CACHE_EXPIRY
  ): Promise<void> {
    try {
      // Set cache item
      const cacheKey = `${StorageKey.CACHE_PREFIX}${key}`;
      await this.setItem(cacheKey, value);
      
      // Set expiration timestamp
      const expiryKey = `${StorageKey.CACHE_EXPIRY_PREFIX}${key}`;
      const expiryTime = Date.now() + expiry;
      await this.setItem(expiryKey, expiryTime);
    } catch (error) {
      console.error(`Error setting cached item [${key}]:`, error);
      throw error;
    }
  }
  
  /**
   * Get cached item
   * 
   * @param key - Cache key
   * @returns Cached value or null if expired or not found
   */
  public async getCachedItem<T>(key: string): Promise<T | null> {
    try {
      // Get expiration time
      const expiryKey = `${StorageKey.CACHE_EXPIRY_PREFIX}${key}`;
      const expiryTime = await this.getItem<number>(expiryKey);
      
      // Check if expired
      if (expiryTime === null || Date.now() > expiryTime) {
        // Remove expired cache
        const cacheKey = `${StorageKey.CACHE_PREFIX}${key}`;
        await this.removeItem(cacheKey);
        await this.removeItem(expiryKey);
        return null;
      }
      
      // Get cached value
      const cacheKey = `${StorageKey.CACHE_PREFIX}${key}`;
      return await this.getItem<T>(cacheKey);
    } catch (error) {
      console.error(`Error getting cached item [${key}]:`, error);
      return null;
    }
  }
  
  /**
   * Remove cached item
   * 
   * @param key - Cache key
   */
  public async removeCachedItem(key: string): Promise<void> {
    try {
      const cacheKey = `${StorageKey.CACHE_PREFIX}${key}`;
      const expiryKey = `${StorageKey.CACHE_EXPIRY_PREFIX}${key}`;
      
      await this.removeItem(cacheKey);
      await this.removeItem(expiryKey);
    } catch (error) {
      console.error(`Error removing cached item [${key}]:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all expired cache items
   */
  public async clearExpiredCache(): Promise<void> {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter expiry keys
      const expiryKeys = keys.filter(key => 
        key.startsWith(StorageKey.CACHE_EXPIRY_PREFIX)
      );
      
      // Check each expiry
      for (const expiryKey of expiryKeys) {
        const expiryJson = await AsyncStorage.getItem(expiryKey);
        
        if (expiryJson !== null) {
          const expiryTime = JSON.parse(expiryJson);
          
          if (Date.now() > expiryTime) {
            // Extract cache key from expiry key
            const cacheKey = expiryKey.replace(
              StorageKey.CACHE_EXPIRY_PREFIX,
              StorageKey.CACHE_PREFIX
            );
            
            // Remove expired cache
            await this.removeItem(cacheKey);
            await this.removeItem(expiryKey);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }
  
  /**
   * Save user data
   * 
   * @param user - User data to save
   */
  public async saveUser(user: User): Promise<void> {
    await this.setItem(StorageKey.USER, user);
  }
  
  /**
   * Get user data
   * 
   * @returns User data or null if not found
   */
  public async getUser(): Promise<User | null> {
    return await this.getItem<User>(StorageKey.USER);
  }
  
  /**
   * Save user settings
   * 
   * @param settings - User settings to save
   */
  public async saveUserSettings(settings: UserSettings): Promise<void> {
    await this.setItem(StorageKey.USER_SETTINGS, settings);
  }
  
  /**
   * Get user settings
   * 
   * @returns User settings or default settings if not found
   */
  public async getUserSettings(): Promise<UserSettings> {
    const settings = await this.getItem<UserSettings>(StorageKey.USER_SETTINGS);
    
    if (settings) {
      return settings;
    }
    
    // Default settings
    return {
      theme: 'system',
      language: 'en',
      downloadQuality: 'auto',
      streamingQuality: 'auto',
      autoplay: true,
      notifications: {
        newEpisodes: true,
        offers: true,
        reminders: true,
        updates: true,
      },
      downloadOverMobile: false,
      subtitlesEnabled: true,
      subtitlesLanguage: 'en',
      audioLanguage: 'en',
      playbackSpeed: 1.0,
    };
  }
  
  /**
   * Save user preferences
   * 
   * @param preferences - User preferences to save
   */
  public async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await this.setItem(StorageKey.USER_PREFERENCES, preferences);
  }
  
  /**
   * Get user preferences
   * 
   * @returns User preferences or default preferences if not found
   */
  public async getUserPreferences(): Promise<UserPreferences> {
    const preferences = await this.getItem<UserPreferences>(StorageKey.USER_PREFERENCES);
    
    if (preferences) {
      return preferences;
    }
    
    // Default preferences
    return {
      favoriteGenres: [],
      favoriteTags: [],
      watchedSeries: [],
      likedSeries: [],
      watchHistory: [],
    };
  }
  
  /**
   * Save watch history
   * 
   * @param watchHistory - Watch history to save
   */
  public async saveWatchHistory(watchHistory: WatchHistory[]): Promise<void> {
    await this.setItem(StorageKey.WATCH_HISTORY, watchHistory);
  }
  
  /**
   * Get watch history
   * 
   * @returns Watch history or empty array if not found
   */
  public async getWatchHistory(): Promise<WatchHistory[]> {
    const watchHistory = await this.getItem<WatchHistory[]>(StorageKey.WATCH_HISTORY);
    return watchHistory || [];
  }
  
  /**
   * Add item to watch history
   * 
   * @param item - Watch history item to add
   * @returns Updated watch history
   */
  public async addToWatchHistory(item: WatchHistory): Promise<WatchHistory[]> {
    const watchHistory = await this.getWatchHistory();
    
    // Check if item already exists
    const existingIndex = watchHistory.findIndex(
      hist => hist.episodeId === item.episodeId
    );
    
    if (existingIndex !== -1) {
      // Update existing item
      watchHistory[existingIndex] = {
        ...watchHistory[existingIndex],
        ...item,
        lastWatched: new Date().toISOString(),
      };
    } else {
      // Add new item
      watchHistory.unshift({
        ...item,
        lastWatched: new Date().toISOString(),
      });
    }
    
    // Limit history size
    const limitedHistory = watchHistory.slice(0, 100);
    
    // Save updated history
    await this.saveWatchHistory(limitedHistory);
    
    return limitedHistory;
  }
  
  /**
   * Save watchlist
   * 
   * @param watchlist - Watchlist to save
   */
  public async saveWatchlist(watchlist: WatchlistItem[]): Promise<void> {
    await this.setItem(StorageKey.WATCHLIST, watchlist);
  }
  
  /**
   * Get watchlist
   * 
   * @returns Watchlist or empty array if not found
   */
  public async getWatchlist(): Promise<WatchlistItem[]> {
    const watchlist = await this.getItem<WatchlistItem[]>(StorageKey.WATCHLIST);
    return watchlist || [];
  }
  
  /**
   * Add item to watchlist
   * 
   * @param seriesId - Series ID to add
   * @param series - Series details
   * @returns Updated watchlist
   */
  public async addToWatchlist(
    seriesId: number,
    series: DramaSeries
  ): Promise<WatchlistItem[]> {
    const watchlist = await this.getWatchlist();
    const userId = (await this.getUser())?.id || 0;
    
    // Check if already in watchlist
    if (!watchlist.some(item => item.seriesId === seriesId)) {
      // Add to watchlist
      const newItem: WatchlistItem = {
        id: Date.now(),
        userId,
        seriesId,
        addedAt: new Date().toISOString(),
        series: {
          id: series.id,
          title: series.title,
          coverImage: series.coverImage,
          genre: series.genre,
          releaseDate: series.releaseDate,
          totalEpisodes: series.totalEpisodes,
          averageRating: series.averageRating,
        },
      };
      
      watchlist.unshift(newItem);
      
      // Save updated watchlist
      await this.saveWatchlist(watchlist);
    }
    
    return watchlist;
  }
  
  /**
   * Remove item from watchlist
   * 
   * @param seriesId - Series ID to remove
   * @returns Updated watchlist
   */
  public async removeFromWatchlist(seriesId: number): Promise<WatchlistItem[]> {
    const watchlist = await this.getWatchlist();
    
    // Filter out series
    const updatedWatchlist = watchlist.filter(
      item => item.seriesId !== seriesId
    );
    
    // Save updated watchlist
    await this.saveWatchlist(updatedWatchlist);
    
    return updatedWatchlist;
  }
  
  /**
   * Save downloads
   * 
   * @param downloads - Downloads to save
   */
  public async saveDownloads(downloads: Download[]): Promise<void> {
    await this.setItem(StorageKey.DOWNLOADS, downloads);
  }
  
  /**
   * Get downloads
   * 
   * @returns Downloads or empty array if not found
   */
  public async getDownloads(): Promise<Download[]> {
    const downloads = await this.getItem<Download[]>(StorageKey.DOWNLOADS);
    return downloads || [];
  }
  
  /**
   * Add download
   * 
   * @param download - Download to add
   * @returns Updated downloads
   */
  public async addDownload(download: Download): Promise<Download[]> {
    const downloads = await this.getDownloads();
    
    // Check if already downloaded
    const existingIndex = downloads.findIndex(
      item => item.episodeId === download.episodeId
    );
    
    if (existingIndex !== -1) {
      // Update existing download
      downloads[existingIndex] = {
        ...downloads[existingIndex],
        ...download,
        downloadDate: new Date().toISOString(),
      };
    } else {
      // Add new download
      downloads.unshift({
        ...download,
        downloadDate: new Date().toISOString(),
      });
    }
    
    // Save updated downloads
    await this.saveDownloads(downloads);
    
    return downloads;
  }
  
  /**
   * Remove download
   * 
   * @param episodeId - Episode ID to remove
   * @returns Updated downloads
   */
  public async removeDownload(episodeId: number): Promise<Download[]> {
    const downloads = await this.getDownloads();
    
    // Filter out episode
    const updatedDownloads = downloads.filter(
      item => item.episodeId !== episodeId
    );
    
    // Save updated downloads
    await this.saveDownloads(updatedDownloads);
    
    return updatedDownloads;
  }
  
  /**
   * Save series data
   * 
   * @param series - Series data to save
   */
  public async saveSeries(series: DramaSeries): Promise<void> {
    const key = `${StorageKey.SERIES_PREFIX}${series.id}`;
    await this.setItem(key, series);
  }
  
  /**
   * Get series data
   * 
   * @param seriesId - Series ID to get
   * @returns Series data or null if not found
   */
  public async getSeries(seriesId: number): Promise<DramaSeries | null> {
    const key = `${StorageKey.SERIES_PREFIX}${seriesId}`;
    return await this.getItem<DramaSeries>(key);
  }
  
  /**
   * Save episode data
   * 
   * @param episode - Episode data to save
   */
  public async saveEpisode(episode: Episode): Promise<void> {
    const key = `${StorageKey.EPISODE_PREFIX}${episode.id}`;
    await this.setItem(key, episode);
  }
  
  /**
   * Get episode data
   * 
   * @param episodeId - Episode ID to get
   * @returns Episode data or null if not found
   */
  public async getEpisode(episodeId: number): Promise<Episode | null> {
    const key = `${StorageKey.EPISODE_PREFIX}${episodeId}`;
    return await this.getItem<Episode>(key);
  }
  
  /**
   * Save recent series
   * 
   * @param seriesIds - Recent series IDs to save
   */
  public async saveRecentSeries(seriesIds: number[]): Promise<void> {
    await this.setItem(StorageKey.RECENT_SERIES, seriesIds);
  }
  
  /**
   * Get recent series
   * 
   * @returns Recent series IDs or empty array if not found
   */
  public async getRecentSeries(): Promise<number[]> {
    const seriesIds = await this.getItem<number[]>(StorageKey.RECENT_SERIES);
    return seriesIds || [];
  }
  
  /**
   * Add to recent series
   * 
   * @param seriesId - Series ID to add to recents
   * @returns Updated recent series IDs
   */
  public async addToRecentSeries(seriesId: number): Promise<number[]> {
    let recentSeries = await this.getRecentSeries();
    
    // Remove if already exists
    recentSeries = recentSeries.filter(id => id !== seriesId);
    
    // Add to beginning
    recentSeries.unshift(seriesId);
    
    // Limit to 20 items
    recentSeries = recentSeries.slice(0, 20);
    
    // Save updated recents
    await this.saveRecentSeries(recentSeries);
    
    return recentSeries;
  }
  
  /**
   * Clear all stored data
   */
  public async clearAll(): Promise<void> {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Clear all keys
      await AsyncStorage.multiRemove(keys);
      
      // Clear memory cache
      this.memoryCache.clear();
      
      // Re-initialize
      await this.init();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
  
  /**
   * Clear user data (for logout)
   */
  public async clearUserData(): Promise<void> {
    try {
      // Keys to remove
      const keysToRemove = [
        StorageKey.AUTH_TOKEN,
        StorageKey.REFRESH_TOKEN,
        StorageKey.USER,
        StorageKey.USER_PREFERENCES,
        StorageKey.WATCH_HISTORY,
        StorageKey.WATCHLIST,
      ];
      
      // Remove keys
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Remove from memory cache
      keysToRemove.forEach(key => this.memoryCache.delete(key));
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
  
  /**
   * Get estimated storage usage
   * 
   * @returns Storage usage in bytes
   */
  public async getStorageUsage(): Promise<number> {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Get size of each item
      let totalSize = 0;
      
      await Promise.all(
        keys.map(async (key) => {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        })
      );
      
      return totalSize;
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return 0;
    }
  }
  
  /**
   * Get all keys matching a prefix
   * 
   * @param prefix - Key prefix to match
   * @returns Array of matching keys
   */
  public async getKeysByPrefix(prefix: string): Promise<string[]> {
    try {
      // Get all keys
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter by prefix
      return allKeys.filter(key => key.startsWith(prefix));
    } catch (error) {
      console.error(`Error getting keys by prefix [${prefix}]:`, error);
      return [];
    }
  }
  
  /**
   * Get multiple items
   * 
   * @param keys - Keys to get
   * @returns Object mapping keys to values
   */
  public async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const results: Record<string, any> = {};
      
      // First check memory cache
      const uncachedKeys = [];
      
      for (const key of keys) {
        if (this.memoryCache.has(key)) {
          results[key] = this.memoryCache.get(key);
        } else {
          uncachedKeys.push(key);
        }
      }
      
      // Get remaining from AsyncStorage
      if (uncachedKeys.length > 0) {
        const pairs = await AsyncStorage.multiGet(uncachedKeys);
        
        pairs.forEach(([key, value]) => {
          if (value !== null) {
            try {
              const parsedValue = JSON.parse(value);
              results[key] = parsedValue;
              
              // Update memory cache
              this.memoryCache.set(key, parsedValue);
            } catch (error) {
              console.error(`Error parsing value for key [${key}]:`, error);
            }
          }
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  }
}

// Export as singleton
export default new StorageService();