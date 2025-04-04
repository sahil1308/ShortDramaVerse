/**
 * Storage Service
 * 
 * Handles all local storage operations for the application
 * including persistence of user preferences, auth tokens, and cache.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/config';

/**
 * StorageService Class
 * 
 * Provides methods for interacting with device storage
 */
class StorageService {
  /**
   * Saves auth token to storage
   * 
   * @param token JWT auth token
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  }

  /**
   * Retrieves auth token from storage
   * 
   * @returns The stored auth token or null if not found
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Saves refresh token to storage
   * 
   * @param token JWT refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  /**
   * Retrieves refresh token from storage
   * 
   * @returns The stored refresh token or null if not found
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Clears all authentication data from storage
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  /**
   * Saves user data to storage
   * 
   * @param userData User object to store
   */
  async setUser(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  /**
   * Retrieves user data from storage
   * 
   * @returns The stored user data or null if not found
   */
  async getUser<T>(): Promise<T | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Saves watch history to storage
   * 
   * @param watchHistory Array of watch history items
   */
  async setWatchHistory(watchHistory: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(watchHistory));
    } catch (error) {
      console.error('Error saving watch history:', error);
      throw error;
    }
  }

  /**
   * Retrieves watch history from storage
   * 
   * @returns The stored watch history or empty array if not found
   */
  async getWatchHistory<T>(): Promise<T[]> {
    try {
      const watchHistory = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
      return watchHistory ? JSON.parse(watchHistory) : [];
    } catch (error) {
      console.error('Error getting watch history:', error);
      return [];
    }
  }

  /**
   * Adds an item to watch history
   * 
   * @param item New watch history item
   * @param maxItems Maximum number of items to keep in history
   */
  async addToWatchHistory(item: any, maxItems: number = 20): Promise<void> {
    try {
      const history = await this.getWatchHistory<any>();
      
      // Remove if already exists (to move to top of list)
      const filteredHistory = history.filter(historyItem => historyItem.id !== item.id);
      
      // Add new item at the beginning
      const newHistory = [item, ...filteredHistory].slice(0, maxItems);
      
      await this.setWatchHistory(newHistory);
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  }

  /**
   * Updates progress for an item in watch history
   * 
   * @param id ID of the item to update
   * @param progressData New progress data
   */
  async updateWatchProgress(id: number, progressData: any): Promise<void> {
    try {
      const history = await this.getWatchHistory<any>();
      const itemIndex = history.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        history[itemIndex] = { ...history[itemIndex], ...progressData };
        await this.setWatchHistory(history);
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
      throw error;
    }
  }

  /**
   * Saves user app preferences 
   * 
   * @param key Preference key
   * @param value Preference value
   */
  async setPreference<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving preference ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves user app preference
   * 
   * @param key Preference key
   * @param defaultValue Default value if preference not found
   * @returns The stored preference value or defaultValue if not found
   */
  async getPreference<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Error getting preference ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Saves search history to storage
   * 
   * @param searchHistory Array of search terms
   */
  async setSearchHistory(searchHistory: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
      throw error;
    }
  }

  /**
   * Retrieves search history from storage
   * 
   * @returns The stored search history or empty array if not found
   */
  async getSearchHistory(): Promise<string[]> {
    try {
      const searchHistory = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return searchHistory ? JSON.parse(searchHistory) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Adds a term to search history
   * 
   * @param term Search term to add
   * @param maxItems Maximum number of items to keep in history
   */
  async addToSearchHistory(term: string, maxItems: number = 10): Promise<void> {
    try {
      if (!term || term.trim() === '') return;
      
      const history = await this.getSearchHistory();
      
      // Remove if already exists (to move to top of list)
      const filteredHistory = history.filter(item => item.toLowerCase() !== term.toLowerCase());
      
      // Add new item at the beginning
      const newHistory = [term, ...filteredHistory].slice(0, maxItems);
      
      await this.setSearchHistory(newHistory);
    } catch (error) {
      console.error('Error adding to search history:', error);
      throw error;
    }
  }

  /**
   * Clears search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  /**
   * Sets device ID for analytics and tracking
   * 
   * @param deviceId Unique device identifier
   */
  async setDeviceId(deviceId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    } catch (error) {
      console.error('Error saving device ID:', error);
      throw error;
    }
  }

  /**
   * Gets device ID for analytics and tracking
   * 
   * @returns The stored device ID or null if not found
   */
  async getDeviceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    } catch (error) {
      console.error('Error getting device ID:', error);
      return null;
    }
  }

  /**
   * Gets multi-key data from storage
   * 
   * @param keys List of keys to fetch
   * @returns Object with key-value pairs or null values for missing keys
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      return Object.fromEntries(
        keyValuePairs.map(([key, value]) => [key, value ? JSON.parse(value) : null])
      );
    } catch (error) {
      console.error('Error in multiGet:', error);
      return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
    }
  }

  /**
   * Clears all app data from storage
   * Warning: This will clear all stored app data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();