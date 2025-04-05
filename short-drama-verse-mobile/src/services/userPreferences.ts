/**
 * User Preferences Service
 * 
 * Manages user content preferences for personalized recommendations.
 */
import { storageService } from './storage';
import { apiService } from './api';
import { analyticsService } from './analytics';
import { AnalyticsEventType } from './analytics';
import { ContentPreferences } from '@/types/content';

// Storage key for preferences
const PREFERENCES_STORAGE_KEY = 'content_preferences';

// API endpoint
const PREFERENCES_ENDPOINT = '/user/preferences/content';

// Default preferences
const DEFAULT_PREFERENCES: ContentPreferences = {
  favoriteGenres: [],
  dislikedGenres: []
};

class UserPreferencesService {
  private preferences: ContentPreferences = { ...DEFAULT_PREFERENCES };
  private isInitialized = false;
  
  /**
   * Initialize preferences
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Try to load preferences from storage first
      const storedPreferences = await storageService.getJsonItem<ContentPreferences>(PREFERENCES_STORAGE_KEY);
      
      if (storedPreferences) {
        this.preferences = storedPreferences;
      } else {
        // If not in storage, try to get from API
        try {
          const apiPreferences = await apiService.get<ContentPreferences>(PREFERENCES_ENDPOINT, {}, { requireAuth: true });
          
          if (apiPreferences) {
            this.preferences = apiPreferences;
            await this.saveToStorage();
          }
        } catch (error) {
          console.error('Error fetching preferences from API:', error);
          // Use defaults if API fails
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing user preferences:', error);
      // Use defaults if initialization fails
    }
  }
  
  /**
   * Save preferences to storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      await storageService.setJsonItem(PREFERENCES_STORAGE_KEY, this.preferences);
    } catch (error) {
      console.error('Error saving preferences to storage:', error);
    }
  }
  
  /**
   * Sync preferences with API
   */
  private async syncWithAPI(): Promise<void> {
    try {
      await apiService.put(PREFERENCES_ENDPOINT, this.preferences, { requireAuth: true });
    } catch (error) {
      console.error('Error syncing preferences with API:', error);
      
      // Track sync error
      analyticsService.trackEvent(AnalyticsEventType.ERROR, {
        feature: 'preferences',
        operation: 'syncWithAPI',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get content preferences
   */
  async getContentPreferences(): Promise<ContentPreferences> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return { ...this.preferences };
  }
  
  /**
   * Update content preferences
   */
  async updateContentPreferences(preferences: Partial<ContentPreferences>): Promise<ContentPreferences> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Update preferences
    this.preferences = {
      ...this.preferences,
      ...preferences
    };
    
    // Save to storage
    await this.saveToStorage();
    
    // Sync with API
    await this.syncWithAPI();
    
    // Track preference update
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'preferences_updated',
      updated_fields: Object.keys(preferences)
    });
    
    return { ...this.preferences };
  }
  
  /**
   * Add a genre to favorites
   */
  async addFavoriteGenre(genre: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Don't add if already in favorites
    if (this.preferences.favoriteGenres.includes(genre)) {
      return;
    }
    
    // Remove from disliked genres if present
    if (this.preferences.dislikedGenres.includes(genre)) {
      this.preferences.dislikedGenres = this.preferences.dislikedGenres.filter(g => g !== genre);
    }
    
    // Add to favorites
    this.preferences.favoriteGenres = [...this.preferences.favoriteGenres, genre];
    
    // Save and sync
    await this.saveToStorage();
    await this.syncWithAPI();
    
    // Track favorite added
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'genre_favorite_added',
      genre
    });
  }
  
  /**
   * Remove a genre from favorites
   */
  async removeFavoriteGenre(genre: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Remove from favorites
    this.preferences.favoriteGenres = this.preferences.favoriteGenres.filter(g => g !== genre);
    
    // Save and sync
    await this.saveToStorage();
    await this.syncWithAPI();
    
    // Track favorite removed
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'genre_favorite_removed',
      genre
    });
  }
  
  /**
   * Add a genre to disliked
   */
  async addDislikedGenre(genre: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Don't add if already in disliked
    if (this.preferences.dislikedGenres.includes(genre)) {
      return;
    }
    
    // Remove from favorites if present
    if (this.preferences.favoriteGenres.includes(genre)) {
      this.preferences.favoriteGenres = this.preferences.favoriteGenres.filter(g => g !== genre);
    }
    
    // Add to disliked
    this.preferences.dislikedGenres = [...this.preferences.dislikedGenres, genre];
    
    // Save and sync
    await this.saveToStorage();
    await this.syncWithAPI();
    
    // Track disliked added
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'genre_disliked_added',
      genre
    });
  }
  
  /**
   * Remove a genre from disliked
   */
  async removeDislikedGenre(genre: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Remove from disliked
    this.preferences.dislikedGenres = this.preferences.dislikedGenres.filter(g => g !== genre);
    
    // Save and sync
    await this.saveToStorage();
    await this.syncWithAPI();
    
    // Track disliked removed
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'genre_disliked_removed',
      genre
    });
  }
  
  /**
   * Check if a genre is favorited
   */
  async isGenreFavorited(genre: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.preferences.favoriteGenres.includes(genre);
  }
  
  /**
   * Check if a genre is disliked
   */
  async isGenreDisliked(genre: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.preferences.dislikedGenres.includes(genre);
  }
  
  /**
   * Reset all preferences to default
   */
  async resetPreferences(): Promise<void> {
    this.preferences = { ...DEFAULT_PREFERENCES };
    
    // Save to storage
    await this.saveToStorage();
    
    // Sync with API
    await this.syncWithAPI();
    
    // Track reset
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'preferences_reset'
    });
  }
}

// Export singleton instance
export const userPreferencesService = new UserPreferencesService();