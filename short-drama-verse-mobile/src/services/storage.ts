/**
 * Storage Service
 * 
 * Provides persistent data storage capabilities for the application.
 * Abstracts AsyncStorage implementation for easier testing and flexibility.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service Class
 * Handles all persistent storage operations in the app
 */
class StorageService {
  private isInitialized = false;

  /**
   * Initialize the storage service
   * Performs any necessary setup before storage can be used
   */
  async initialize(): Promise<void> {
    try {
      // Check if storage is accessible by writing and reading a test value
      await this.setItem('__test__', 'test');
      const testValue = await this.getItem('__test__');
      if (testValue !== 'test') {
        throw new Error('Storage test failed: values do not match');
      }
      await this.removeItem('__test__');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }

  /**
   * Store a key-value pair
   * @param key The storage key
   * @param value The value to store (will be JSON stringified if object)
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
      await AsyncStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting item [${key}]:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value by key
   * @param key The storage key
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      
      // Try to parse as JSON, return as is if not valid JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Error getting item [${key}]:`, error);
      throw error;
    }
  }

  /**
   * Remove a key-value pair
   * @param key The storage key to remove
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item [${key}]:`, error);
      throw error;
    }
  }

  /**
   * Clear all stored data
   * Use with caution - this will wipe all app data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys stored in storage
   * @returns Array of all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      throw error;
    }
  }

  /**
   * Store multiple key-value pairs at once
   * @param pairs Array of [key, value] pairs to store
   */
  async multiSet(pairs: [string, any][]): Promise<void> {
    try {
      const processedPairs = pairs.map(([key, value]) => {
        const processedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        return [key, processedValue];
      });
      await AsyncStorage.multiSet(processedPairs as [string, string][]);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  /**
   * Get multiple values by their keys
   * @param keys Array of keys to retrieve
   * @returns Array of values in the same order as the keys
   */
  async multiGet(keys: string[]): Promise<any[]> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      return results.map(([_, value]) => {
        if (value === null) {
          return null;
        }
        
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Error getting multiple items:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const storageService = new StorageService();