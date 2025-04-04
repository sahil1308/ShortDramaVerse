/**
 * Drama Types
 * 
 * Contains all types and interfaces related to drama series and episodes.
 */

/**
 * Drama Series Interface
 * Represents a drama series in the system
 */
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  thumbnailImage: string;
  bannerImage: string | null;
  genre: string[];
  releaseYear: number;
  country: string;
  language: string;
  director: string;
  cast: string[];
  averageRating: number | null;
  ratingCount: number;
  episodeCount: number;
  totalDuration: number; // in minutes
  isPremium: boolean;
  isCompleted: boolean;
  isComingSoon: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  viewCount: number;
  tags: string[];
}

/**
 * Episode Interface
 * Represents an episode of a drama series
 */
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  episodeNumber: number;
  seasonNumber: number;
  duration: number; // in minutes
  videoUrl: string;
  streamingUrl: string | null; // URL for streaming
  downloadUrl: string | null; // URL for downloading (premium feature)
  releaseDate: string; // ISO date string
  isPremium: boolean;
  isFree: boolean; // First few episodes might be free even in premium series
  isAvailable: boolean; // Might be temporarily unavailable
  viewCount: number;
  subtitles: Subtitle[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Subtitle Interface
 * Represents subtitle tracks for episodes
 */
export interface Subtitle {
  id: number;
  episodeId: number;
  language: string;
  url: string; // URL to subtitle file (WebVTT format)
  isDefault: boolean;
}

/**
 * Watch History Interface
 * Represents a user's watch history entry
 */
export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  seriesId: number;
  watchedAt: string; // ISO date string
  progress: number; // Percentage watched (0-100)
  completed: boolean;
  duration: number; // How long they watched in seconds
}

/**
 * Watchlist Interface
 * Represents a series in a user's watchlist
 */
export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  addedAt: string; // ISO date string
  position?: number; // Optional ordering position
}

/**
 * Rating Interface
 * Represents a user's rating for a series
 */
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number; // 1-5 stars
  review: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  likeCount: number;
  dislikeCount: number;
}

/**
 * Comment Interface
 * Represents a user's comment on an episode
 */
export interface Comment {
  id: number;
  userId: number;
  episodeId: number;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  likeCount: number;
  dislikeCount: number;
  parentId: number | null; // For replies, references parent comment
}

/**
 * Download Interface
 * Represents a downloaded episode on the device
 */
export interface Download {
  id: number;
  episodeId: number;
  seriesId: number;
  title: string;
  fileSize: number; // in bytes
  filePath: string; // Local file path
  thumbnailPath: string | null; // Local thumbnail path
  downloadedAt: string; // ISO date string
  expiresAt: string | null; // ISO date string, might have expiration for some content
  quality: 'standard' | 'high';
  isCompleted: boolean;
  progress: number; // Download progress (0-100)
}

/**
 * Genre Interface
 * Represents a content genre
 */
export interface Genre {
  id: number;
  name: string;
  description: string;
  coverImage: string | null;
  seriesCount: number;
}

/**
 * Content Filter Interface
 * For filtering drama series
 */
export interface ContentFilter {
  genre?: string[];
  country?: string[];
  language?: string[];
  releaseYear?: number[];
  isPremium?: boolean;
  isCompleted?: boolean;
  minRating?: number;
  sortBy?: 'popularity' | 'rating' | 'newest' | 'oldest';
  searchQuery?: string;
}