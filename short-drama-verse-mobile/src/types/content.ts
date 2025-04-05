/**
 * Content Types
 * 
 * Type definitions for content-related data structures.
 */

/**
 * Drama series
 */
export interface DramaSeries {
  /**
   * Unique identifier
   */
  id: number;
  
  /**
   * Series title
   */
  title: string;
  
  /**
   * Series description
   */
  description: string;
  
  /**
   * Cover image URL (poster/banner)
   */
  coverImage: string;
  
  /**
   * Thumbnail image URL (smaller image for lists/grids)
   */
  thumbnailImage: string;
  
  /**
   * List of genre names
   */
  genres: string[];
  
  /**
   * Series tone/mood (e.g., "light", "dark", "serious", "comedy")
   */
  tone: string;
  
  /**
   * List of theme names
   */
  themes: string[];
  
  /**
   * List of actor names
   */
  actors: string[];
  
  /**
   * List of director names
   */
  directors: string[];
  
  /**
   * Country of origin
   */
  country: string;
  
  /**
   * Primary language
   */
  language: string;
  
  /**
   * Release year
   */
  releaseYear: number;
  
  /**
   * Total number of episodes
   */
  episodeCount: number;
  
  /**
   * Average episode duration in minutes
   */
  episodeDuration: number;
  
  /**
   * Average rating (0-5 stars)
   */
  averageRating?: number;
  
  /**
   * Number of views/watches
   */
  viewCount?: number;
  
  /**
   * Whether series is premium (requires payment)
   */
  isPremium: boolean;
  
  /**
   * Series has been completed (not ongoing)
   */
  isComplete: boolean;
  
  /**
   * List of content keywords
   */
  keywords: string[];
  
  /**
   * Date when series was created/added
   */
  createdAt: string;
  
  /**
   * Date when series was last updated
   */
  updatedAt: string;
  
  /**
   * Episodes (may be loaded separately or included with series)
   */
  episodes?: Episode[];
}

/**
 * Series episode
 */
export interface Episode {
  /**
   * Unique identifier
   */
  id: number;
  
  /**
   * Reference to parent series
   */
  seriesId: number;
  
  /**
   * Episode number within series
   */
  episodeNumber: number;
  
  /**
   * Season number (if applicable)
   */
  seasonNumber?: number;
  
  /**
   * Episode title
   */
  title: string;
  
  /**
   * Episode description
   */
  description: string;
  
  /**
   * Thumbnail image URL
   */
  thumbnailImage: string;
  
  /**
   * Video URL/identifier
   */
  videoUrl: string;
  
  /**
   * Duration in seconds
   */
  duration: number;
  
  /**
   * Whether episode is premium (requires payment)
   */
  isPremium: boolean;
  
  /**
   * Cost in coins (if premium)
   */
  coinCost?: number;
  
  /**
   * Whether episode has subtitles
   */
  hasSubtitles: boolean;
  
  /**
   * Whether episode has dubbed audio
   */
  hasDubbing: boolean;
  
  /**
   * Available subtitle languages
   */
  subtitleLanguages?: string[];
  
  /**
   * Available audio languages
   */
  audioLanguages?: string[];
  
  /**
   * Release date
   */
  releaseDate: string;
  
  /**
   * Average rating (0-5 stars)
   */
  averageRating?: number;
  
  /**
   * Number of views/watches
   */
  viewCount?: number;
  
  /**
   * Date when episode was created/added
   */
  createdAt: string;
  
  /**
   * Date when episode was last updated
   */
  updatedAt: string;
}

/**
 * Content genre
 */
export interface Genre {
  /**
   * Unique identifier
   */
  id: number;
  
  /**
   * Genre name
   */
  name: string;
  
  /**
   * Genre description
   */
  description: string;
  
  /**
   * Genre icon/image URL
   */
  iconImage?: string;
}

/**
 * Content creator (actor, director, etc.)
 */
export interface Creator {
  /**
   * Unique identifier
   */
  id: number;
  
  /**
   * Creator name
   */
  name: string;
  
  /**
   * Creator role (actor, director, writer, etc.)
   */
  role: string;
  
  /**
   * Profile image URL
   */
  profileImage?: string;
  
  /**
   * Creator bio/description
   */
  bio?: string;
  
  /**
   * Country of origin
   */
  country?: string;
  
  /**
   * List of series IDs they've worked on
   */
  series?: number[];
}

/**
 * Watch history entry
 */
export interface WatchHistoryEntry {
  /**
   * Reference to content ID (series or episode)
   */
  contentId: number;
  
  /**
   * Type of content watched
   */
  contentType: 'series' | 'episode';
  
  /**
   * Watch progress (0.0 to 1.0)
   */
  progress: number;
  
  /**
   * Last playback position in seconds
   */
  position: number;
  
  /**
   * Whether content was completed
   */
  completed: boolean;
  
  /**
   * Date of last watch
   */
  lastWatched: string;
}

/**
 * Watchlist item
 */
export interface WatchlistItem {
  /**
   * Reference to content ID (series or episode)
   */
  contentId: number;
  
  /**
   * Type of content in watchlist
   */
  contentType: 'series' | 'episode';
  
  /**
   * Date when added to watchlist
   */
  addedAt: string;
  
  /**
   * User note (optional)
   */
  note?: string;
  
  /**
   * Associated series or episode object (may be loaded separately)
   */
  content?: DramaSeries | Episode;
}

/**
 * Search result item
 */
export interface SearchResult {
  /**
   * Unique identifier of the content
   */
  id: number;
  
  /**
   * Content title
   */
  title: string;
  
  /**
   * Type of content found
   */
  type: 'series' | 'episode' | 'creator';
  
  /**
   * Thumbnail image URL
   */
  thumbnailImage: string;
  
  /**
   * Brief description/excerpt
   */
  description: string;
  
  /**
   * Match score (0.0 to 1.0)
   */
  score: number;
}