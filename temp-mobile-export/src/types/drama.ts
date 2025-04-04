/**
 * Type definitions for ShortDramaVerse Mobile
 * 
 * This file contains type definitions for the drama series,
 * episodes, user data, and analytics data.
 */

// User model
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: Date | null;
  isAdmin: boolean;
  coinBalance: number;
}

// Drama series model
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  genre: string[];
  tags: string[];
  releaseDate: string;
  isCompleted: boolean;
  totalEpisodes: number;
  averageRating: number;
  viewCount: number;
  isPremium: boolean;
  creatorId: number;
  creatorName: string;
  isInWatchlist: boolean;
  createdAt: string;
  updatedAt: string;
}

// Episode model
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  duration: number;
  seasonNumber: number;
  episodeNumber: number;
  releaseDate: string;
  videoUrl: string;
  isFree: boolean;
  coinCost: number;
  viewCount: number;
  isWatched: boolean;
  watchProgress: number | null;
  createdAt: string;
  updatedAt: string;
}

// Watch history model
export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  seriesId: number;
  watchProgress: number;
  duration: number;
  completed: boolean;
  lastWatched: string;
  episode: {
    id: number;
    title: string;
    thumbnailImage: string;
    duration: number;
    episodeNumber: number;
    seasonNumber: number;
  };
  series: {
    id: number;
    title: string;
    coverImage: string;
  };
}

// Watchlist item model
export interface WatchlistItem {
  id: number;
  userId: number;
  seriesId: number;
  addedAt: string;
  series: {
    id: number;
    title: string;
    coverImage: string;
    genre: string[];
    releaseDate: string;
    totalEpisodes: number;
    averageRating: number;
  };
}

// User download model
export interface Download {
  id: number;
  episodeId: number;
  seriesId: number;
  localPath: string;
  downloadDate: string;
  expiryDate: string | null;
  size: number;
  isComplete: boolean;
  episode: {
    id: number;
    title: string;
    thumbnailImage: string;
    duration: number;
    episodeNumber: number;
    seasonNumber: number;
  };
  series: {
    id: number;
    title: string;
    coverImage: string;
  };
}

// User comment model
export interface Comment {
  id: number;
  userId: number;
  seriesId: number | null;
  episodeId: number | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
  replies?: Comment[];
  likesCount: number;
  isLiked: boolean;
}

// User rating model
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
}

// Payment transaction model
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  currencyCode: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'purchase' | 'subscription' | 'refund' | 'gift';
  description: string;
  createdAt: string;
  receiptId: string | null;
  episodeId: number | null;
  seriesId: number | null;
  packageId: number | null;
}

// Subscription model
export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: 'active' | 'canceled' | 'expired' | 'paused';
  startDate: string;
  endDate: string;
  renewalDate: string | null;
  canceledAt: string | null;
  plan: {
    id: number;
    name: string;
    price: number;
    currencyCode: string;
    interval: 'monthly' | 'quarterly' | 'yearly';
    description: string;
  };
}

// Notification model
export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: 'episode' | 'series' | 'system' | 'payment' | 'social';
  isRead: boolean;
  createdAt: string;
  episodeId: number | null;
  seriesId: number | null;
  transactionId: number | null;
  actionUrl: string | null;
}

// Content metrics for analytics
export interface ContentMetrics {
  viewsTotal: number;
  viewsToday: number;
  viewsWeek: number;
  viewsMonth: number;
  completionRate: number;
  avgWatchTime: number;
  uniqueViewers: number;
  subscriberViewers: number;
  guestViewers: number;
  shareCount: number;
  ratingsAvg: number;
  ratingsCount: number;
  commentsCount: number;
  watchlistAdds: number;
  downloadCount: number;
  viewsByCountry: Record<string, number>;
  viewsByDevice: Record<string, number>;
  viewsByTime: Record<string, number>;
  viewsByAge: Record<string, number>;
  viewsByGender: Record<string, number>;
}

// User metrics for analytics
export interface UserMetrics {
  totalWatchTime: number;
  watchTimeThisWeek: number;
  episodesWatched: number;
  episodesCompleted: number;
  seriesStarted: number;
  seriesCompleted: number;
  commentsPosted: number;
  ratingsGiven: number;
  watchlistCount: number;
  downloadsCount: number;
  favoriteGenres: Record<string, number>;
  watchTimeByDay: Record<string, number>;
  watchTimeByHour: Record<string, number>;
}

// Dashboard metrics for admin analytics
export interface DashboardMetrics {
  activeUsers: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    change: number;
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
    newToday: number;
    newWeek: number;
    churnRate: number;
  };
  content: {
    totalSeries: number;
    totalEpisodes: number;
    premiumSeries: number;
    premiumEpisodes: number;
    freeSeries: number;
    freeEpisodes: number;
  };
  engagement: {
    watchTimeTotal: number;
    watchTimeToday: number;
    watchTimeWeek: number;
    avgSessionLength: number;
    avgCompletionRate: number;
    avgRating: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    bySubscription: number;
    byOneTimePurchase: number;
  };
}

// Combined analytics data
export interface AnalyticsData {
  content?: ContentMetrics;
  user?: UserMetrics;
  dashboard?: DashboardMetrics;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Settings model
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  downloadQuality: 'low' | 'medium' | 'high' | 'auto';
  streamingQuality: 'low' | 'medium' | 'high' | 'auto';
  autoplay: boolean;
  notifications: {
    newEpisodes: boolean;
    offers: boolean;
    reminders: boolean;
    updates: boolean;
  };
  downloadOverMobile: boolean;
  subtitlesEnabled: boolean;
  subtitlesLanguage: string;
  audioLanguage: string;
  playbackSpeed: number;
}

// Search filters model
export interface SearchFilters {
  query: string;
  genres?: string[];
  tags?: string[];
  sortBy?: 'relevance' | 'newest' | 'rating' | 'views' | 'title';
  isPremium?: boolean;
  isCompleted?: boolean;
  releaseYear?: number;
}

// Search results model
export interface SearchResults {
  series: DramaSeries[];
  episodes: Episode[];
  total: number;
  page: number;
  totalPages: number;
}

// User preferences for recommendations
export interface UserPreferences {
  favoriteGenres: string[];
  favoriteTags: string[];
  watchedSeries: number[];
  likedSeries: number[];
  watchHistory: {
    episodeId: number;
    seriesId: number;
    completionRate: number;
  }[];
}

// Creator profile model
export interface Creator {
  id: number;
  name: string;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seriesCount: number;
  episodeCount: number;
  totalViews: number;
  averageRating: number;
  series: DramaSeries[];
}

// App state model for managing overall app state
export interface AppState {
  isNetworkAvailable: boolean;
  lastSyncTime: string | null;
  appVersion: string;
  isFirstLaunch: boolean;
  hasCompletedOnboarding: boolean;
  currentlyPlayingEpisode: number | null;
  appOpenCount: number;
  deviceId: string;
  installedDate: string;
  lastUpdateDate: string | null;
}

// Server config for remote configuration
export interface ServerConfig {
  featuresEnabled: {
    downloads: boolean;
    comments: boolean;
    subscriptions: boolean;
    ratings: boolean;
    sharing: boolean;
    offlineMode: boolean;
  };
  minAppVersion: string;
  recommendedAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
  helpCenterUrl: string;
  contactEmail: string;
  supportPhone: string | null;
  socialLinks: {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
  };
}