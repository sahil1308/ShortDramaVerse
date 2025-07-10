/**
 * Storage Service
 * 
 * Provides persistent local storage with encryption support.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import EncryptedStorage from 'react-native-encrypted-storage';

// Storage instance for fast access
const storage = new MMKV();

// Storage keys
const STORAGE_PREFIX = 'sdv_'; // ShortDramaVerse prefix
const SECURE_STORAGE_PREFIX = 'sdv_secure_';

class StorageService {
  /**
   * Store a string value
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Store in both MMKV (fast) and AsyncStorage (reliable)
      storage.set(prefixedKey, value);
      await AsyncStorage.setItem(prefixedKey, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve a string value
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Try MMKV first (faster)
      let value = storage.getString(prefixedKey);
      
      // Fall back to AsyncStorage if not in MMKV
      if (value === undefined) {
        value = await AsyncStorage.getItem(prefixedKey);
        
        // If found in AsyncStorage but not MMKV, update MMKV for next time
        if (value !== null) {
          storage.set(prefixedKey, value);
        }
      }
      
      return value || null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Store a numeric value
   */
  async setNumber(key: string, value: number): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Store in both MMKV and AsyncStorage
      storage.set(prefixedKey, value);
      await AsyncStorage.setItem(prefixedKey, value.toString());
    } catch (error) {
      console.error(`Error storing number ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve a numeric value
   */
  async getNumber(key: string): Promise<number | null> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Try MMKV first
      const mmkvValue = storage.getNumber(prefixedKey);
      
      if (mmkvValue !== undefined) {
        return mmkvValue;
      }
      
      // Fall back to AsyncStorage
      const value = await AsyncStorage.getItem(prefixedKey);
      if (value !== null) {
        const numValue = parseFloat(value);
        // Update MMKV for next time
        storage.set(prefixedKey, numValue);
        return numValue;
      }
      
      return null;
    } catch (error) {
      console.error(`Error retrieving number ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Store a boolean value
   */
  async setBoolean(key: string, value: boolean): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Store in both MMKV and AsyncStorage
      storage.set(prefixedKey, value);
      await AsyncStorage.setItem(prefixedKey, value ? '1' : '0');
    } catch (error) {
      console.error(`Error storing boolean ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve a boolean value
   */
  async getBoolean(key: string): Promise<boolean | null> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Try MMKV first
      const mmkvValue = storage.getBoolean(prefixedKey);
      
      if (mmkvValue !== undefined) {
        return mmkvValue;
      }
      
      // Fall back to AsyncStorage
      const value = await AsyncStorage.getItem(prefixedKey);
      if (value !== null) {
        const boolValue = value === '1';
        // Update MMKV for next time
        storage.set(prefixedKey, boolValue);
        return boolValue;
      }
      
      return null;
    } catch (error) {
      console.error(`Error retrieving boolean ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Store an object as JSON
   */
  async setJsonItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing JSON ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve an object from JSON
   */
  async getJsonItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Error retrieving JSON ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Remove from both storages
      storage.delete(prefixedKey);
      await AsyncStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      // Clear both storages
      storage.clearAll();
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
  
  /**
   * Check if a key exists in storage
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.prefixKey(key);
      // Check MMKV first
      if (storage.contains(prefixedKey)) {
        return true;
      }
      
      // Fall back to AsyncStorage
      const value = await AsyncStorage.getItem(prefixedKey);
      return value !== null;
    } catch (error) {
      console.error(`Error checking if key ${key} exists:`, error);
      return false;
    }
  }
  
  /**
   * Get all keys in storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      // Get keys from AsyncStorage (more reliable for this operation)
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter to only our prefixed keys and remove prefix
      return allKeys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.substring(STORAGE_PREFIX.length));
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
  
  /**
   * Store sensitive data securely (encrypted)
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      const prefixedKey = this.prefixSecureKey(key);
      await EncryptedStorage.setItem(prefixedKey, value);
    } catch (error) {
      console.error(`Error storing secure ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve sensitive data securely (encrypted)
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      const prefixedKey = this.prefixSecureKey(key);
      const value = await EncryptedStorage.getItem(prefixedKey);
      return value;
    } catch (error) {
      console.error(`Error retrieving secure ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Remove sensitive data
   */
  async removeSecureItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.prefixSecureKey(key);
      await EncryptedStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error(`Error removing secure ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all secure storage
   */
  async clearSecureStorage(): Promise<void> {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  }
  
  /**
   * Store a JSON object securely
   */
  async setSecureJsonItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setSecureItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing secure JSON ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve a JSON object securely
   */
  async getSecureJsonItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getSecureItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Error retrieving secure JSON ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Prefix a key for consistency
   */
  private prefixKey(key: string): string {
    if (key.startsWith(STORAGE_PREFIX)) {
      return key;
    }
    return `${STORAGE_PREFIX}${key}`;
  }
  
  /**
   * Prefix a secure key for consistency
   */
  private prefixSecureKey(key: string): string {
    if (key.startsWith(SECURE_STORAGE_PREFIX)) {
      return key;
    }
    return `${SECURE_STORAGE_PREFIX}${key}`;
  }
}

// Export singleton instance
export const storageService = new StorageService();