// Types for drama series data

export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  genres: string[];
  releaseYear: number;
  country: string;
  language: string;
  director: string;
  cast: string[];
  totalEpisodes: number;
  averageRating: number | null;
  totalRatings: number;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  videoUrl: string;
  duration: number; // Duration in seconds
  episodeNumber: number;
  releaseDate: string;
  viewCount: number;
  isFree: boolean;
  premiumPrice?: number; // Price in coins for premium episodes
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number; // Rating from 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
  };
}

export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  createdAt: string;
  series?: DramaSeries;
}

export interface WatchlistWithSeries extends Watchlist {
  series: DramaSeries;
}

export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  seriesId: number;
  watchedAt: string;
  progress: number; // Progress in seconds
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  episode?: Episode;
  series?: DramaSeries;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'purchase' | 'refund' | 'reward';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  referenceId?: string; // For external payment references
  createdAt: string;
  episodeId?: number;
  seriesId?: number;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string; 
  placement: 'home_banner' | 'series_detail' | 'episode_player' | 'search';
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  series: DramaSeries[];
  totalCount: number;
}

export interface HomeContent {
  featured: DramaSeries[];
  trending: DramaSeries[];
  newest: DramaSeries[];
  continueWatching?: (WatchHistory & { 
    episode: Episode; 
    series: DramaSeries;
  })[];
  advertisements: Advertisement[];
}

export interface SeriesDetailsWithRelated {
  series: DramaSeries;
  episodes: Episode[];
  ratings: Rating[];
  isInWatchlist: boolean;
  related: DramaSeries[];
}

export interface UserProfile {
  totalWatched: number;
  watchTimeMinutes: number;
  favoriteGenres: { genre: string; count: number }[];
  recentActivity: WatchHistory[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// Request and response types
export interface RatingRequest {
  seriesId: number;
  rating: number;
  comment?: string;
}

export interface WatchHistoryRequest {
  episodeId: number;
  seriesId: number;
  progress: number;
  isCompleted: boolean;
}

export interface PurchaseRequest {
  episodeId: number;
  seriesId: number;
}

export interface CoinPurchaseRequest {
  amount: number;
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
}

// Extended types with additional client-side properties
export interface EpisodeWithPurchaseStatus extends Episode {
  isPremium: boolean;
  purchased: boolean;
  coinPrice: number;
}

export interface WatchHistoryWithProgress extends WatchHistory {
  progressSeconds: number;
  progressPercentage: number;
}

// Navigation types
export interface RootStackParamList {
  Home: undefined;
  SeriesDetails: { seriesId: number };
  EpisodePlayer: { episodeId: number, seriesId: number };
  SignIn: undefined; 
  SignUp: undefined;
  UserProfile: undefined;
  Search: undefined;
  Watchlist: undefined;
  Settings: undefined;
}

export interface TabParamList {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
}