/**
 * Drama Types
 * 
 * Type definitions for drama series, episodes, and related content.
 */

/**
 * Drama Series
 * Represents a drama series in the application
 */
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  genre: string[];
  releaseYear: number;
  rating: number;
  director: string;
  cast: string[];
  totalEpisodes: number;
  language: string;
  country: string;
  status: 'ongoing' | 'completed' | 'coming_soon';
  viewCount: number;
  trailerUrl?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Episode
 * Represents an episode in a drama series
 */
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  episodeNumber: number;
  duration: number; // In seconds
  thumbnailUrl: string;
  videoUrl: string;
  viewCount: number;
  releaseDate: string;
  subtitles?: SubtitleTrack[];
  isFree?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Subtitle Track
 * Represents a subtitle track for an episode
 */
export interface SubtitleTrack {
  id: number;
  episodeId: number;
  language: string;
  url: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Movie
 * Represents a standalone movie (not part of a series)
 */
export interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  genre: string[];
  releaseYear: number;
  rating: number;
  director: string;
  cast: string[];
  duration: number; // In seconds
  language: string;
  country: string;
  viewCount: number;
  videoUrl: string;
  trailerUrl?: string;
  subtitles?: SubtitleTrack[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Watch Progress
 * Represents a user's watch progress for a specific episode or movie
 */
export interface WatchProgress {
  id: number;
  userId: number;
  contentId: number;
  contentType: 'episode' | 'movie';
  position: number; // In seconds
  completed: boolean;
  lastWatched: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Watchlist Item
 * Represents an item in a user's watchlist
 */
export interface WatchlistItem {
  id: number;
  userId: number;
  contentId: number;
  contentType: 'series' | 'movie';
  addedAt: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Episode Comment
 * Represents a user comment on an episode
 */
export interface Comment {
  id: number;
  userId: number;
  username: string;
  profilePicture?: string;
  contentId: number;
  contentType: 'episode' | 'series' | 'movie';
  text: string;
  timestamp: number; // In seconds, for episode comments at specific times
  likes: number;
  createdAt?: Date;
  updatedAt?: Date;
  replies?: Comment[];
}

/**
 * User Rating
 * Represents a user's rating for a series or movie
 */
export interface UserRating {
  id: number;
  userId: number;
  contentId: number;
  contentType: 'series' | 'movie';
  rating: number; // 1-5 stars
  review?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Recommendation
 * Represents a content recommendation for a user
 */
export interface Recommendation {
  id: number;
  userId: number;
  contentId: number;
  contentType: 'series' | 'movie';
  score: number; // Recommendation score
  reason: string;
  createdAt?: Date;
}

/**
 * Featured Content
 * Represents content featured on the home page
 */
export interface FeaturedContent {
  id: number;
  contentId: number;
  contentType: 'series' | 'movie';
  title: string;
  description: string;
  imageUrl: string;
  priority: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}