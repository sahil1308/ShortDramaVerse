/**
 * User Preferences Hook
 * 
 * Custom hook for accessing and managing user preferences data.
 */
import { useState, useEffect, useCallback } from 'react';
import { ContentPreferences } from '@/types/preferences';
import { storageService } from '@/services/storage';
import { useAnonymousUser } from './useAnonymousUser';

const PREFERENCES_KEY = 'user_preferences';

interface UserPreferencesState {
  preferences: ContentPreferences;
  isLoading: boolean;
  error: Error | null;
}

export function useUserPreferences() {
  const [state, setState] = useState<UserPreferencesState>({
    preferences: {},
    isLoading: true,
    error: null
  });
  
  const { user, isLoading: isUserLoading } = useAnonymousUser();
  
  // Load preferences from storage
  const loadPreferences = useCallback(async () => {
    if (isUserLoading || !user) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get preferences from storage
      const prefs = await storageService.getJsonItem<ContentPreferences>(
        `${PREFERENCES_KEY}_${user.id}`
      );
      
      setState(prev => ({ 
        ...prev, 
        preferences: prefs || {}, 
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error loading user preferences:', err);
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err : new Error('Failed to load preferences'),
        isLoading: false 
      }));
    }
  }, [user, isUserLoading]);
  
  // Effect to load preferences when user is loaded
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<ContentPreferences>) => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Merge with existing preferences
      const updatedPreferences = {
        ...state.preferences,
        ...newPreferences
      };
      
      // Save to storage
      await storageService.setJsonItem(
        `${PREFERENCES_KEY}_${user.id}`,
        updatedPreferences
      );
      
      setState(prev => ({ 
        ...prev, 
        preferences: updatedPreferences, 
        isLoading: false 
      }));
      
      return updatedPreferences;
    } catch (err) {
      console.error('Error updating user preferences:', err);
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err : new Error('Failed to update preferences'),
        isLoading: false 
      }));
      throw err;
    }
  }, [user, state.preferences]);
  
  // Clear preferences
  const clearPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Remove from storage
      await storageService.removeItem(`${PREFERENCES_KEY}_${user.id}`);
      
      setState(prev => ({ 
        ...prev, 
        preferences: {}, 
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error clearing user preferences:', err);
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err : new Error('Failed to clear preferences'),
        isLoading: false 
      }));
      throw err;
    }
  }, [user]);
  
  // Update favorite genres
  const updateFavoriteGenres = useCallback(async (genres: string[]) => {
    return updatePreferences({ favoriteGenres: genres });
  }, [updatePreferences]);
  
  // Toggle a genre in favorites
  const toggleFavoriteGenre = useCallback(async (genre: string) => {
    if (!user) return;
    
    const currentFavorites = state.preferences.favoriteGenres || [];
    const isAlreadyFavorite = currentFavorites.includes(genre);
    
    let updatedFavorites;
    if (isAlreadyFavorite) {
      // Remove genre from favorites
      updatedFavorites = currentFavorites.filter(g => g !== genre);
    } else {
      // Add genre to favorites
      updatedFavorites = [...currentFavorites, genre];
    }
    
    return updatePreferences({ favoriteGenres: updatedFavorites });
  }, [user, state.preferences, updatePreferences]);
  
  // Update preferred languages
  const updatePreferredLanguages = useCallback(async (languages: string[]) => {
    return updatePreferences({ preferredLanguages: languages });
  }, [updatePreferences]);
  
  // Update preferred countries
  const updatePreferredCountries = useCallback(async (countries: string[]) => {
    return updatePreferences({ preferredCountries: countries });
  }, [updatePreferences]);
  
  // Update preferred tone
  const updatePreferredTone = useCallback(async (tone: string) => {
    return updatePreferences({ preferredTone: tone });
  }, [updatePreferences]);
  
  return {
    ...state,
    updatePreferences,
    clearPreferences,
    updateFavoriteGenres,
    toggleFavoriteGenre,
    updatePreferredLanguages,
    updatePreferredCountries,
    updatePreferredTone,
    refresh: loadPreferences
  };
}