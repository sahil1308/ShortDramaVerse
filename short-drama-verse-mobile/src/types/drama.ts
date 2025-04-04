/**
 * Drama Models
 * 
 * Type definitions for drama series and episodes.
 */

/**
 * User Type
 * 
 * Represents a user in the system.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: string;
  isAdmin: boolean;
  coinBalance: number;
}

/**
 * Drama Series Type
 * 
 * Represents a drama series in the app.
 */
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  genre: string[];
  releaseYear: number;
  director: string;
  cast: string[];
  totalEpisodes: number;
  averageRating: number;
  isComplete: boolean;
  country: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  tags: string[];
}

/**
 * Episode Type
 * 
 * Represents an episode within a drama series.
 */
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  duration: number;
  videoUrl: string;
  episodeNumber: number;
  releaseDate: string;
  isFree: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Watchlist Type
 * 
 * Represents a user's watchlist entry.
 */
export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  addedAt: string;
  series?: DramaSeries;
}

/**
 * Watch History Type
 * 
 * Represents a user's watch history entry.
 */
export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  seriesId: number;
  watchedAt: string;
  progress: number;
  completed: boolean;
  episode?: Episode;
  series?: DramaSeries;
}

/**
 * Rating Type
 * 
 * Represents a user's rating for a drama series.
 */
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'username' | 'profilePicture'>;
}

/**
 * Transaction Type
 * 
 * Represents a financial transaction in the system.
 */
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'PURCHASE' | 'REFUND' | 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  referenceId: string | null;
  createdAt: string;
}

/**
 * Advertisement Type
 * 
 * Represents an advertisement in the system.
 */
export interface Advertisement {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Analytics Data Type
 * 
 * Represents analytics data for a time period.
 */
export interface AnalyticsData {
  period: string;
  viewCount: number;
  uniqueUsers: number;
  watchTime: number;
  completionRate: number;
}

/**
 * Series Analytics Type
 * 
 * Analytics data specific to a series.
 */
export interface SeriesAnalytics {
  seriesId: number;
  title: string;
  viewCount: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  timeData: AnalyticsData[];
}

/**
 * User Analytics Type
 * 
 * Analytics data specific to user engagement.
 */
export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churned: number;
  engagementRate: number;
  timeData: AnalyticsData[];
}

/**
 * Revenue Analytics Type
 * 
 * Analytics data specific to revenue.
 */
export interface RevenueAnalytics {
  totalRevenue: number;
  subscriptionRevenue: number;
  episodePurchases: number;
  adRevenue: number;
  timeData: {
    period: string;
    revenue: number;
    transactions: number;
  }[];
}