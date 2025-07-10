/**
 * Anonymous Authentication Service
 * 
 * This service handles anonymous user identification and tracking
 * without requiring mandatory registration, ensuring privacy while
 * enabling personalized experiences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUniqueId } from './deviceIdentifier';

const ANONYMOUS_USER_ID_KEY = 'anonymous_user_id';
const USER_PREFERENCES_KEY = 'user_preferences';

export interface UserPreferences {
  contentLanguage: string;
  preferredGenres: string[];
  autoPlayEnabled: boolean;
  dataUsageOptimization: boolean;
  notificationsEnabled: boolean;
  lastActiveDate: string;
  totalWatchTime: number;
  favoriteContentIds: string[];
  watchHistory: string[];
}

const defaultPreferences: UserPreferences = {
  contentLanguage: 'en',
  preferredGenres: [],
  autoPlayEnabled: true,
  dataUsageOptimization: false,
  notificationsEnabled: true,
  lastActiveDate: new Date().toISOString(),
  totalWatchTime: 0,
  favoriteContentIds: [],
  watchHistory: [],
};

/**
 * Initialize anonymous authentication system
 */
export const initializeAnonymousAuth = async (): Promise<void> => {
  try {
    // Check if anonymous user already exists
    const existingUserId = await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY);
    
    if (!existingUserId) {
      // Generate new anonymous user ID
      const newUserId = await generateUniqueId();
      await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, newUserId);
      
      // Set default preferences
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(defaultPreferences));
      
      console.log('Anonymous user initialized:', newUserId);
    } else {
      console.log('Existing anonymous user found:', existingUserId);
      
      // Update last active date
      await updateLastActiveDate();
    }
  } catch (error) {
    console.error('Failed to initialize anonymous auth:', error);
    throw error;
  }
};

/**
 * Get or create anonymous user ID
 */
export const getAnonymousUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY);
    
    if (!userId) {
      userId = await generateUniqueId();
      await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(defaultPreferences));
    }
    
    return userId;
  } catch (error) {
    console.error('Failed to get anonymous user ID:', error);
    // Fallback to generated ID
    return await generateUniqueId();
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const preferencesData = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    
    if (preferencesData) {
      return JSON.parse(preferencesData);
    }
    
    return defaultPreferences;
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    return defaultPreferences;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
  try {
    const currentPreferences = await getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    
    console.log('User preferences updated');
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    throw error;
  }
};

/**
 * Update last active date
 */
export const updateLastActiveDate = async (): Promise<void> => {
  try {
    const currentPreferences = await getUserPreferences();
    currentPreferences.lastActiveDate = new Date().toISOString();
    
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(currentPreferences));
  } catch (error) {
    console.error('Failed to update last active date:', error);
  }
};

/**
 * Add content to watch history
 */
export const addToWatchHistory = async (contentId: string): Promise<void> => {
  try {
    const preferences = await getUserPreferences();
    
    // Remove if already exists to avoid duplicates
    const filteredHistory = preferences.watchHistory.filter(id => id !== contentId);
    
    // Add to beginning of array
    filteredHistory.unshift(contentId);
    
    // Keep only last 100 items
    if (filteredHistory.length > 100) {
      filteredHistory.splice(100);
    }
    
    await updateUserPreferences({ watchHistory: filteredHistory });
  } catch (error) {
    console.error('Failed to add to watch history:', error);
  }
};

/**
 * Add content to favorites
 */
export const addToFavorites = async (contentId: string): Promise<void> => {
  try {
    const preferences = await getUserPreferences();
    
    if (!preferences.favoriteContentIds.includes(contentId)) {
      preferences.favoriteContentIds.push(contentId);
      await updateUserPreferences({ favoriteContentIds: preferences.favoriteContentIds });
    }
  } catch (error) {
    console.error('Failed to add to favorites:', error);
  }
};

/**
 * Remove content from favorites
 */
export const removeFromFavorites = async (contentId: string): Promise<void> => {
  try {
    const preferences = await getUserPreferences();
    const filteredFavorites = preferences.favoriteContentIds.filter(id => id !== contentId);
    
    await updateUserPreferences({ favoriteContentIds: filteredFavorites });
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
  }
};

/**
 * Update total watch time
 */
export const updateWatchTime = async (additionalMinutes: number): Promise<void> => {
  try {
    const preferences = await getUserPreferences();
    const newTotalWatchTime = preferences.totalWatchTime + additionalMinutes;
    
    await updateUserPreferences({ totalWatchTime: newTotalWatchTime });
  } catch (error) {
    console.error('Failed to update watch time:', error);
  }
};

/**
 * Clear all user data (for privacy/reset purposes)
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_USER_ID_KEY);
    await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
    
    console.log('User data cleared');
  } catch (error) {
    console.error('Failed to clear user data:', error);
    throw error;
  }
};