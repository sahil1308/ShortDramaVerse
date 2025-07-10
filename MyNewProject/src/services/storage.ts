/**
 * Storage Service
 * 
 * This service handles local data storage, caching, and persistence
 * for the ShortDramaVerse application using AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const APP_SETTINGS_KEY = 'app_settings';
const CACHE_KEYS = {
  FEATURED_DRAMAS: 'cache_featured_dramas',
  POPULAR_DRAMAS: 'cache_popular_dramas',
  RECOMMENDATIONS: 'cache_recommendations',
  SWIPEABLE_CONTENT: 'cache_swipeable_content',
};

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoPlay: boolean;
  dataUsageOptimization: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
  subtitlesEnabled: boolean;
  subtitlesLanguage: string;
  videoQuality: 'auto' | '720p' | '1080p';
  lastAppVersion: string;
  installDate: string;
  lastUpdateDate: string;
}

const defaultAppSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  autoPlay: true,
  dataUsageOptimization: false,
  downloadQuality: 'medium',
  subtitlesEnabled: false,
  subtitlesLanguage: 'en',
  videoQuality: 'auto',
  lastAppVersion: '1.0.0',
  installDate: new Date().toISOString(),
  lastUpdateDate: new Date().toISOString(),
};

/**
 * Check if onboarding has been completed
 */
export const checkOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
};

/**
 * Set onboarding as completed
 */
export const setOnboardingCompleted = async (completed: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed.toString());
  } catch (error) {
    console.error('Failed to set onboarding status:', error);
    throw error;
  }
};

/**
 * Get app settings
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const settingsData = await AsyncStorage.getItem(APP_SETTINGS_KEY);
    
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      return { ...defaultAppSettings, ...settings };
    }
    
    return defaultAppSettings;
  } catch (error) {
    console.error('Failed to get app settings:', error);
    return defaultAppSettings;
  }
};

/**
 * Update app settings
 */
export const updateAppSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getAppSettings();
    const updatedSettings = { 
      ...currentSettings, 
      ...settings,
      lastUpdateDate: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to update app settings:', error);
    throw error;
  }
};

/**
 * Cache data with expiration
 */
export const cacheData = async (
  key: string, 
  data: any, 
  expirationMinutes: number = 60
): Promise<void> => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expirationMinutes,
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
};

/**
 * Get cached data if not expired
 */
export const getCachedData = async (key: string): Promise<any | null> => {
  try {
    const cacheData = await AsyncStorage.getItem(key);
    
    if (!cacheData) {
      return null;
    }
    
    const cacheItem = JSON.parse(cacheData);
    const now = Date.now();
    const expirationTime = cacheItem.timestamp + (cacheItem.expirationMinutes * 60 * 1000);
    
    if (now > expirationTime) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

/**
 * Clear specific cache
 */
export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Clear all app cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const promises = Object.values(CACHE_KEYS).map(key => AsyncStorage.removeItem(key));
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
};

/**
 * Get storage usage information
 */
export const getStorageUsage = async (): Promise<{
  totalKeys: number;
  estimatedSize: number;
  cacheKeys: number;
  userDataKeys: number;
}> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    const cacheKeys = allKeys.filter(key => key.startsWith('cache_')).length;
    const userDataKeys = allKeys.filter(key => 
      !key.startsWith('cache_') && 
      (key.includes('user') || key.includes('preferences') || key.includes('settings'))
    ).length;
    
    // Estimate size (rough calculation)
    let estimatedSize = 0;
    const sampleKeys = allKeys.slice(0, Math.min(10, allKeys.length));
    
    for (const key of sampleKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        estimatedSize += value.length;
      }
    }
    
    // Extrapolate for all keys
    const averageSize = estimatedSize / sampleKeys.length;
    const totalEstimatedSize = Math.round(averageSize * allKeys.length);
    
    return {
      totalKeys: allKeys.length,
      estimatedSize: totalEstimatedSize,
      cacheKeys,
      userDataKeys,
    };
  } catch (error) {
    console.error('Failed to get storage usage:', error);
    return {
      totalKeys: 0,
      estimatedSize: 0,
      cacheKeys: 0,
      userDataKeys: 0,
    };
  }
};

/**
 * Export all data for backup
 */
export const exportAllData = async (): Promise<Record<string, any>> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData: Record<string, any> = {};
    
    for (const key of allKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          allData[key] = JSON.parse(value);
        } catch {
          allData[key] = value;
        }
      }
    }
    
    return allData;
  } catch (error) {
    console.error('Failed to export data:', error);
    return {};
  }
};

/**
 * Import data from backup
 */
export const importData = async (data: Record<string, any>): Promise<void> => {
  try {
    const promises = Object.entries(data).map(([key, value]) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return AsyncStorage.setItem(key, stringValue);
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
};

/**
 * Clear all app data (for reset purposes)
 */
export const clearAllAppData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Failed to clear all app data:', error);
    throw error;
  }
};

/**
 * Cleanup old cache entries
 */
export const cleanupOldCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
    
    for (const key of cacheKeys) {
      // This will automatically remove expired cache entries
      await getCachedData(key);
    }
  } catch (error) {
    console.error('Failed to cleanup old cache:', error);
  }
};