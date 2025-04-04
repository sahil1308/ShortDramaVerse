/**
 * Storage Service
 * 
 * Provides methods for storing and retrieving data from device storage.
 * Uses AsyncStorage as the underlying storage mechanism.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';

/**
 * Storage Service Class
 * 
 * Handles all local storage operations for the application
 */
class StorageService {
  /**
   * Save a value to storage
   * 
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
      throw new Error(`Failed to store data: ${error}`);
    }
  }

  /**
   * Get a value from storage
   * 
   * @param key Storage key
   * @returns The stored value, or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      throw new Error(`Failed to retrieve data: ${error}`);
    }
  }

  /**
   * Remove a value from storage
   * 
   * @param key Storage key
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw new Error(`Failed to remove data: ${error}`);
    }
  }

  /**
   * Clear all app storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  /**
   * Get all storage keys
   * 
   * @returns Array of storage keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      throw new Error(`Failed to get storage keys: ${error}`);
    }
  }

  // Auth specific methods

  /**
   * Set authentication token
   * 
   * @param token JWT token
   */
  async setAuthToken(token: string): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Get authentication token
   * 
   * @returns JWT token or null
   */
  async getAuthToken(): Promise<string | null> {
    return await this.get<string>(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Set refresh token
   * 
   * @param token Refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get refresh token
   * 
   * @returns Refresh token or null
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.get<string>(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store user data
   * 
   * @param user User object
   */
  async setUser<T>(user: T): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.USER, user);
  }

  /**
   * Get user data
   * 
   * @returns User object or null
   */
  async getUser<T>(): Promise<T | null> {
    return await this.get<T>(APP_CONFIG.STORAGE_KEYS.USER);
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData(): Promise<void> {
    await this.remove(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    await this.remove(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    await this.remove(APP_CONFIG.STORAGE_KEYS.USER);
  }

  // Settings methods

  /**
   * Save app settings
   * 
   * @param settings Settings object
   */
  async saveSettings<T>(settings: T): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Get app settings
   * 
   * @returns Settings object or null
   */
  async getSettings<T>(): Promise<T | null> {
    return await this.get<T>(APP_CONFIG.STORAGE_KEYS.SETTINGS);
  }

  /**
   * Update specific settings
   * 
   * @param updates Partial settings to update
   */
  async updateSettings<T>(updates: Partial<T>): Promise<T | null> {
    const current = await this.getSettings<T>();
    if (current) {
      const updated = { ...current, ...updates };
      await this.saveSettings(updated);
      return updated;
    }
    await this.saveSettings(updates as T);
    return updates as T;
  }

  // Watch history methods

  /**
   * Save watch history
   * 
   * @param watchHistory Array of watched items
   */
  async saveWatchHistory<T>(watchHistory: T[]): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.WATCH_HISTORY, watchHistory);
  }

  /**
   * Get watch history
   * 
   * @returns Array of watched items or empty array
   */
  async getWatchHistory<T>(): Promise<T[]> {
    const history = await this.get<T[]>(APP_CONFIG.STORAGE_KEYS.WATCH_HISTORY);
    return history || [];
  }

  /**
   * Add item to watch history
   * 
   * @param item Item to add to history
   * @param maxItems Maximum number of items to keep in history
   */
  async addToWatchHistory<T extends { id: string | number }>(
    item: T,
    maxItems: number = APP_CONFIG.CONTENT.MAX_RECENT_SERIES
  ): Promise<T[]> {
    let history = await this.getWatchHistory<T>();
    
    // Remove item if it already exists (to move it to the top)
    history = history.filter(i => i.id !== item.id);
    
    // Add item to the beginning
    history.unshift(item);
    
    // Trim to max items
    if (history.length > maxItems) {
      history = history.slice(0, maxItems);
    }
    
    await this.saveWatchHistory(history);
    return history;
  }

  /**
   * Clear watch history
   */
  async clearWatchHistory(): Promise<void> {
    await this.remove(APP_CONFIG.STORAGE_KEYS.WATCH_HISTORY);
  }

  // Download management methods

  /**
   * Save downloaded content info
   * 
   * @param downloads Array of download info objects
   */
  async saveDownloads<T>(downloads: T[]): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.DOWNLOADS, downloads);
  }

  /**
   * Get downloaded content info
   * 
   * @returns Array of download info objects or empty array
   */
  async getDownloads<T>(): Promise<T[]> {
    const downloads = await this.get<T[]>(APP_CONFIG.STORAGE_KEYS.DOWNLOADS);
    return downloads || [];
  }

  /**
   * Add download info
   * 
   * @param downloadInfo Info about the downloaded content
   */
  async addDownload<T extends { id: string | number }>(downloadInfo: T): Promise<T[]> {
    const downloads = await this.getDownloads<T>();
    
    // Check if already exists
    const existingIndex = downloads.findIndex(d => d.id === downloadInfo.id);
    
    if (existingIndex >= 0) {
      // Update existing
      downloads[existingIndex] = downloadInfo;
    } else {
      // Add new
      downloads.push(downloadInfo);
    }
    
    await this.saveDownloads(downloads);
    return downloads;
  }

  /**
   * Remove download info
   * 
   * @param id ID of the download to remove
   */
  async removeDownload<T extends { id: string | number }>(id: string | number): Promise<T[]> {
    let downloads = await this.getDownloads<T>();
    downloads = downloads.filter(d => d.id !== id);
    await this.saveDownloads(downloads);
    return downloads;
  }

  /**
   * Clear all downloads info
   */
  async clearDownloads(): Promise<void> {
    await this.remove(APP_CONFIG.STORAGE_KEYS.DOWNLOADS);
  }

  // Search history methods

  /**
   * Save search history
   * 
   * @param searches Array of search terms
   */
  async saveSearchHistory(searches: string[]): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY, searches);
  }

  /**
   * Get search history
   * 
   * @returns Array of search terms or empty array
   */
  async getSearchHistory(): Promise<string[]> {
    const searches = await this.get<string[]>(APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
    return searches || [];
  }

  /**
   * Add search term to history
   * 
   * @param term Search term to add
   * @param maxItems Maximum number of items to keep
   */
  async addSearchTerm(
    term: string,
    maxItems: number = APP_CONFIG.CONTENT.MAX_SEARCH_HISTORY
  ): Promise<string[]> {
    let searches = await this.getSearchHistory();
    
    // Clean the term
    const cleanTerm = term.trim();
    if (!cleanTerm) return searches;
    
    // Remove term if it already exists (to move it to the top)
    searches = searches.filter(t => t.toLowerCase() !== cleanTerm.toLowerCase());
    
    // Add term to the beginning
    searches.unshift(cleanTerm);
    
    // Trim to max items
    if (searches.length > maxItems) {
      searches = searches.slice(0, maxItems);
    }
    
    await this.saveSearchHistory(searches);
    return searches;
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    await this.remove(APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
  }
}

export const storageService = new StorageService();