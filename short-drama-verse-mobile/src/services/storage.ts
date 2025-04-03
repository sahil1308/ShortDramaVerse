import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  WATCH_HISTORY: 'watch_history',
  OFFLINE_CONTENT: 'offline_content',
  APP_SETTINGS: 'app_settings',
};

/**
 * Set authentication token
 */
export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw error;
  }
}

/**
 * Get authentication token
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Remove authentication token
 */
export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
}

/**
 * Save user data
 */
export async function setUserData(userData: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

/**
 * Get user data
 */
export async function getUserData(): Promise<any | null> {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Remove user data
 */
export async function removeUserData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
}

/**
 * Clear all app data from storage
 */
export async function clearAppData(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing app data:', error);
    throw error;
  }
}

/**
 * Save app settings
 */
export async function setAppSettings(settings: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
}

/**
 * Get app settings
 */
export async function getAppSettings(): Promise<any | null> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting app settings:', error);
    return null;
  }
}

/**
 * Save watch history
 */
export async function setWatchHistory(historyData: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(historyData));
  } catch (error) {
    console.error('Error saving watch history:', error);
    throw error;
  }
}

/**
 * Get watch history
 */
export async function getWatchHistory(): Promise<any[] | null> {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
    return history ? JSON.parse(history) : null;
  } catch (error) {
    console.error('Error getting watch history:', error);
    return null;
  }
}

/**
 * Save offline content
 */
export async function setOfflineContent(content: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_CONTENT, JSON.stringify(content));
  } catch (error) {
    console.error('Error saving offline content:', error);
    throw error;
  }
}

/**
 * Get offline content
 */
export async function getOfflineContent(): Promise<any[] | null> {
  try {
    const content = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CONTENT);
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error getting offline content:', error);
    return null;
  }
}