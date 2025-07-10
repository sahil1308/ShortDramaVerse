/**
 * Content Preferences Types
 * 
 * Type definitions for user content preferences.
 */

/**
 * User content preferences for personalized recommendations
 */
export interface ContentPreferences {
  /**
   * List of genre IDs the user prefers
   */
  favoriteGenres?: string[];
  
  /**
   * List of languages the user prefers content in
   */
  preferredLanguages?: string[];
  
  /**
   * List of countries the user prefers content from
   */
  preferredCountries?: string[];
  
  /**
   * Preferred tone/mood for content (e.g., "light", "dark", "serious", "comedy")
   */
  preferredTone?: string;
  
  /**
   * List of creator IDs (actors, directors) the user likes
   */
  favoriteCreators?: string[];
  
  /**
   * User prefers shorter episodes (<15 minutes)
   */
  preferShortEpisodes?: boolean;
  
  /**
   * User prefers content with subtitles
   */
  preferSubtitles?: boolean;
  
  /**
   * User prefers content with dubbed audio
   */
  preferDubbed?: boolean;
  
  /**
   * User prefers completed series vs. ongoing series
   */
  preferCompletedSeries?: boolean;
  
  /**
   * User's preferred times of day to watch content (for scheduling recommendations)
   */
  watchTimes?: {
    morning?: boolean;
    afternoon?: boolean;
    evening?: boolean;
    night?: boolean;
  };
  
  /**
   * User's average watch session duration in minutes
   */
  averageWatchSessionDuration?: number;
  
  /**
   * Timestamp when preferences were last updated
   */
  lastUpdated?: string;
}