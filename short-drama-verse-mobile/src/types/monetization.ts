/**
 * Monetization Types
 * 
 * Type definitions for monetization-related features including
 * subscriptions, coin purchases, and ad-based content unlocking.
 */

/**
 * Subscription Plan
 * Represents a subscription plan available for purchase
 */
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  features: string[];
  popularityIndex: number; // Higher number = more popular
  discount: number; // Percentage discount from regular price
  trialDays: number; // Number of days in free trial (0 = no trial)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Subscription
 * Represents a user's subscription to a plan
 */
export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethodId?: string;
  canceledAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Coin Package
 * Represents a coin package available for purchase
 */
export interface CoinPackage {
  id: number;
  name: string;
  coinAmount: number;
  bonusCoins: number;
  price: number;
  currency: string;
  discount: number; // Percentage discount
  isPopular: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Coin Transaction
 * Represents a coin transaction (purchase or spend)
 */
export interface CoinTransaction {
  id: number;
  userId: number;
  type: 'purchase' | 'spend' | 'reward' | 'refund';
  amount: number;
  balance: number; // Balance after transaction
  description: string;
  metadata?: any; // Additional data about the transaction
  createdAt?: Date;
}

/**
 * Content Purchase
 * Represents a content purchase made with coins
 */
export interface ContentPurchase {
  id: number;
  userId: number;
  contentId: number;
  contentType: 'episode' | 'series' | 'movie';
  coinAmount: number;
  purchaseDate: string;
  expiryDate?: string; // If access is temporary
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Advertisement
 * Represents an advertisement that can be shown to users
 */
export interface Advertisement {
  id: number;
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
  provider: string;
  unitId: string;
  priority: number;
  minInterval: number; // Minimum time between showing ads in milliseconds
  active: boolean;
  placement?: string; // Where the ad can be shown
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Ad Viewing Record
 * Represents a record of a user viewing an advertisement
 */
export interface AdViewingRecord {
  id: number;
  userId: number;
  adId: number;
  contentId?: number;
  contentType?: string;
  completed: boolean;
  viewDate: string;
  rewardGranted: boolean;
  createdAt?: Date;
}

/**
 * Access Control
 * Represents content access control settings
 */
export interface AccessControl {
  contentId: number;
  contentType: 'episode' | 'series' | 'movie';
  accessType: 'free' | 'subscription' | 'coin' | 'ad';
  coinCost?: number;
  requiredSubscriptionLevel?: string;
  adSupported: boolean;
  previewAvailable: boolean;
  previewDuration?: number; // In seconds
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Free Trial Configuration
 * Represents settings for free trial episodes in a series
 */
export interface FreeTrialConfiguration {
  seriesId: number;
  totalFreeEpisodes: number;
  freeEpisodeStrategy: 'sequential' | 'specific' | 'random';
  specificFreeEpisodeIds?: number[];
  previewDuration: number; // In seconds
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payment Method
 * Represents a saved payment method
 */
export interface PaymentMethod {
  id: number;
  userId: number;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay' | 'other';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardBrand?: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Purchase Receipt
 * Represents a receipt for a purchase (subscription or coins)
 */
export interface PurchaseReceipt {
  id: number;
  userId: number;
  transactionId: string;
  productId: string;
  purchaseDate: string;
  expiryDate?: string;
  storeType: 'apple' | 'google' | 'stripe' | 'other';
  receiptData: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}