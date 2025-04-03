import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  WATCH_HISTORY: 'watch_history',
  DOWNLOAD_LIST: 'downloaded_episodes',
  RECENT_SEARCHES: 'recent_searches',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'user_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

// Auth token storage
export const storeToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

// User data storage
export const storeUserData = async <T>(userData: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const getUserData = async <T>(): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

// Theme storage
export const storeTheme = async (theme: 'light' | 'dark' | 'system'): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error storing theme:', error);
    throw error;
  }
};

export const getTheme = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.THEME);
  } catch (error) {
    console.error('Error getting theme:', error);
    return null;
  }
};

// Language storage
export const storeLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error storing language:', error);
    throw error;
  }
};

export const getLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
  } catch (error) {
    console.error('Error getting language:', error);
    return null;
  }
};

// Recent searches
export const storeRecentSearches = async (searches: string[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(searches);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, jsonValue);
  } catch (error) {
    console.error('Error storing recent searches:', error);
    throw error;
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

export const addRecentSearch = async (search: string): Promise<void> => {
  try {
    const searches = await getRecentSearches();
    // Remove duplicates and add new search at the beginning
    const updatedSearches = [search, ...searches.filter(s => s !== search)].slice(0, 10);
    await storeRecentSearches(updatedSearches);
  } catch (error) {
    console.error('Error adding recent search:', error);
    throw error;
  }
};

export const clearRecentSearches = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    throw error;
  }
};

// Watch history
export interface WatchHistoryItem {
  episodeId: number;
  seriesId: number;
  position: number; // Playback position in seconds
  duration: number; // Total duration in seconds
  timestamp: number; // When this was last updated
  completed: boolean;
}

export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

export const updateWatchHistory = async (historyItem: WatchHistoryItem): Promise<void> => {
  try {
    const history = await getWatchHistory();
    
    // Find existing history item index
    const existingIndex = history.findIndex(
      item => item.episodeId === historyItem.episodeId
    );
    
    // Update or add the history item
    if (existingIndex >= 0) {
      history[existingIndex] = historyItem;
    } else {
      history.unshift(historyItem);
    }
    
    // Keep only the last 100 items
    const updatedHistory = history.slice(0, 100);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATCH_HISTORY,
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error('Error updating watch history:', error);
    throw error;
  }
};

export const removeFromWatchHistory = async (episodeId: number): Promise<void> => {
  try {
    const history = await getWatchHistory();
    const updatedHistory = history.filter(item => item.episodeId !== episodeId);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATCH_HISTORY,
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error('Error removing from watch history:', error);
    throw error;
  }
};

export const clearWatchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
  } catch (error) {
    console.error('Error clearing watch history:', error);
    throw error;
  }
};

// Onboarding status
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
    throw error;
  }
};

export const getOnboardingStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return status === 'true';
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};

// User settings
export interface UserSettings {
  notifications: boolean;
  autoplay: boolean;
  downloadOnWifi: boolean;
  videoQuality: 'auto' | 'low' | 'medium' | 'high';
  subtitlesEnabled: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  playbackSpeed: number;
}

export const defaultSettings: UserSettings = {
  notifications: true,
  autoplay: true,
  downloadOnWifi: true,
  videoQuality: 'auto',
  subtitlesEnabled: true,
  subtitleSize: 'medium',
  playbackSpeed: 1.0,
};

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return jsonValue != null ? { ...defaultSettings, ...JSON.parse(jsonValue) } : defaultSettings;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return defaultSettings;
  }
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  try {
    const currentSettings = await getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(updatedSettings)
    );
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Generic storage functions
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

export const getData = async (key: string): Promise<any> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      // If it's not JSON, return the raw value
      return value;
    }
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};