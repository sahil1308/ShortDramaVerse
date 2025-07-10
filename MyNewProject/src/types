/**
 * User Types
 * 
 * Contains all types and interfaces related to users.
 */

/**
 * User Role Enum
 * Different user roles with varying permissions
 */
export enum UserRole {
  VIEWER = 'viewer',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  CONTENT_MANAGER = 'content_manager',
  MODERATOR = 'moderator',
}

/**
 * Subscription Type Enum
 * Different subscription plans
 */
export enum SubscriptionType {
  NONE = 'none',
  BASIC = 'basic',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
}

/**
 * User Interface
 * Represents a user in the system
 */
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  role: UserRole;
  subscription: SubscriptionType;
  coinBalance: number;
  isVerified: boolean;
  createdAt: string; // ISO date string
  lastLogin: string | null; // ISO date string
  preferences: UserPreferences;
}

/**
 * User Preferences Interface
 * User-configurable settings and preferences
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  autoplay: boolean;
  subtitleLanguage: string | null;
  defaultVideoQuality: 'auto' | 'low' | 'medium' | 'high';
  emailNotifications: boolean;
  pushNotifications: boolean;
  downloadQuality: 'standard' | 'high';
}

/**
 * User Profile Update Interface
 * Fields that can be updated in a user profile
 */
export interface UserProfileUpdate {
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  email?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * User Authentication Interface
 * User data and tokens returned from authentication
 */
export interface UserAuth {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until token expires
}

/**
 * User Stats Interface
 * User statistics and metrics
 */
export interface UserStats {
  totalWatchTime: number; // minutes
  episodesWatched: number;
  seriesCompleted: number;
  averageRating: number | null;
  favoriteGenres: string[];
  joinedDate: string; // ISO date string
  subscriptionDays: number; // days as a subscriber
  lastActive: string; // ISO date string
}

/**
 * Transaction Interface
 * Represents a user transaction (coin purchase, subscription, etc.)
 */
export interface Transaction {
  id: number;
  userId: number;
  type: 'subscription' | 'coin_purchase' | 'content_purchase';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string; // ISO date string
  paymentMethod: string;
  metadata: Record<string, any>; // Additional transaction data
}

/**
 * Notification Interface
 * Represents a user notification
 */
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'system' | 'content' | 'social' | 'transaction';
  isRead: boolean;
  createdAt: string; // ISO date string
  actionUrl: string | null; // Deep link URL to relevant content
  image: string | null; // URL to notification image
}