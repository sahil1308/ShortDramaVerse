/**
 * Access Control Service
 * 
 * This service handles content access control, monetization,
 * and premium content management for the ShortDramaVerse application.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserPreferences } from './anonymousAuth';

const USER_COINS_KEY = 'user_coins';
const SUBSCRIPTION_KEY = 'user_subscription';
const ACCESS_HISTORY_KEY = 'access_history';

export interface UserCoins {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
  transactions: CoinTransaction[];
}

export interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent' | 'purchased';
  amount: number;
  description: string;
  timestamp: string;
  contentId?: string;
}

export interface UserSubscription {
  isActive: boolean;
  plan: 'free' | 'basic' | 'premium';
  startDate?: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
}

export interface AccessResult {
  hasAccess: boolean;
  reason: 'free' | 'subscription' | 'coins' | 'ad' | 'denied';
  message: string;
  cost?: number;
  alternatives?: AccessAlternative[];
}

export interface AccessAlternative {
  type: 'ad' | 'coins' | 'subscription';
  description: string;
  cost?: number;
  action: string;
}

const defaultUserCoins: UserCoins = {
  balance: 100, // Give users some starting coins
  totalEarned: 100,
  totalSpent: 0,
  lastUpdated: new Date().toISOString(),
  transactions: [
    {
      id: 'welcome_bonus',
      type: 'earned',
      amount: 100,
      description: 'Welcome bonus',
      timestamp: new Date().toISOString(),
    },
  ],
};

const defaultSubscription: UserSubscription = {
  isActive: false,
  plan: 'free',
  autoRenew: false,
  features: ['ads', 'basic_content'],
};

/**
 * Check if user has access to specific content
 */
export const checkEpisodeAccess = async (
  userId: string,
  dramaId: string,
  episodeId: string
): Promise<AccessResult> => {
  try {
    // For demo purposes, simulate different access scenarios
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% of content is free
      return {
        hasAccess: true,
        reason: 'free',
        message: 'This content is free to watch.',
      };
    }
    
    const subscription = await getUserSubscription(userId);
    if (subscription.isActive && subscription.plan !== 'free') {
      return {
        hasAccess: true,
        reason: 'subscription',
        message: 'Access granted through your subscription.',
      };
    }
    
    // Premium content requires payment
    return {
      hasAccess: false,
      reason: 'denied',
      message: 'This is premium content that requires payment.',
      cost: 50, // 50 coins
      alternatives: [
        {
          type: 'ad',
          description: 'Watch a 30-second ad to unlock this episode',
          action: 'watch_ad',
        },
        {
          type: 'coins',
          description: 'Use 50 coins to unlock this episode',
          cost: 50,
          action: 'use_coins',
        },
        {
          type: 'subscription',
          description: 'Subscribe for unlimited access to all content',
          action: 'subscribe',
        },
      ],
    };
  } catch (error) {
    console.error('Failed to check episode access:', error);
    return {
      hasAccess: false,
      reason: 'denied',
      message: 'Unable to verify access at this time.',
    };
  }
};

/**
 * Get user's coin balance and history
 */
export const getUserCoins = async (userId: string): Promise<UserCoins> => {
  try {
    const coinsData = await AsyncStorage.getItem(`${USER_COINS_KEY}_${userId}`);
    
    if (coinsData) {
      return JSON.parse(coinsData);
    }
    
    // First time user, give them default coins
    await updateUserCoins(userId, defaultUserCoins);
    return defaultUserCoins;
  } catch (error) {
    console.error('Failed to get user coins:', error);
    return defaultUserCoins;
  }
};

/**
 * Update user's coin balance
 */
export const updateUserCoins = async (userId: string, coins: UserCoins): Promise<void> => {
  try {
    coins.lastUpdated = new Date().toISOString();
    await AsyncStorage.setItem(`${USER_COINS_KEY}_${userId}`, JSON.stringify(coins));
  } catch (error) {
    console.error('Failed to update user coins:', error);
    throw error;
  }
};

/**
 * Add coins to user's balance
 */
export const addCoins = async (
  userId: string,
  amount: number,
  description: string,
  contentId?: string
): Promise<void> => {
  try {
    const userCoins = await getUserCoins(userId);
    
    const transaction: CoinTransaction = {
      id: `earn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'earned',
      amount,
      description,
      timestamp: new Date().toISOString(),
      contentId,
    };
    
    userCoins.balance += amount;
    userCoins.totalEarned += amount;
    userCoins.transactions.unshift(transaction);
    
    // Keep only last 100 transactions
    if (userCoins.transactions.length > 100) {
      userCoins.transactions.splice(100);
    }
    
    await updateUserCoins(userId, userCoins);
    
    console.log(`Added ${amount} coins to user ${userId}: ${description}`);
  } catch (error) {
    console.error('Failed to add coins:', error);
    throw error;
  }
};

/**
 * Spend coins from user's balance
 */
export const spendCoins = async (
  userId: string,
  amount: number,
  description: string,
  contentId?: string
): Promise<boolean> => {
  try {
    const userCoins = await getUserCoins(userId);
    
    if (userCoins.balance < amount) {
      return false; // Insufficient balance
    }
    
    const transaction: CoinTransaction = {
      id: `spend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'spent',
      amount,
      description,
      timestamp: new Date().toISOString(),
      contentId,
    };
    
    userCoins.balance -= amount;
    userCoins.totalSpent += amount;
    userCoins.transactions.unshift(transaction);
    
    // Keep only last 100 transactions
    if (userCoins.transactions.length > 100) {
      userCoins.transactions.splice(100);
    }
    
    await updateUserCoins(userId, userCoins);
    
    console.log(`Spent ${amount} coins for user ${userId}: ${description}`);
    return true;
  } catch (error) {
    console.error('Failed to spend coins:', error);
    return false;
  }
};

/**
 * Get user's subscription status
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  try {
    const subscriptionData = await AsyncStorage.getItem(`${SUBSCRIPTION_KEY}_${userId}`);
    
    if (subscriptionData) {
      const subscription = JSON.parse(subscriptionData);
      
      // Check if subscription is still active
      if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        subscription.isActive = false;
        subscription.plan = 'free';
        await updateUserSubscription(userId, subscription);
      }
      
      return subscription;
    }
    
    return defaultSubscription;
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    return defaultSubscription;
  }
};

/**
 * Update user's subscription
 */
export const updateUserSubscription = async (
  userId: string,
  subscription: UserSubscription
): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${SUBSCRIPTION_KEY}_${userId}`, JSON.stringify(subscription));
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
};

/**
 * Grant access through ad watching
 */
export const grantAdAccess = async (
  userId: string,
  contentId: string
): Promise<void> => {
  try {
    // Record access in history
    await recordAccessHistory(userId, contentId, 'ad');
    
    // Give user bonus coins for watching ad
    await addCoins(userId, 10, 'Watched advertisement', contentId);
    
    console.log(`Granted ad access to ${contentId} for user ${userId}`);
  } catch (error) {
    console.error('Failed to grant ad access:', error);
    throw error;
  }
};

/**
 * Grant access through coin spending
 */
export const grantCoinAccess = async (
  userId: string,
  contentId: string,
  cost: number
): Promise<boolean> => {
  try {
    const success = await spendCoins(userId, cost, `Unlocked content: ${contentId}`, contentId);
    
    if (success) {
      await recordAccessHistory(userId, contentId, 'coins');
      console.log(`Granted coin access to ${contentId} for user ${userId}`);
    }
    
    return success;
  } catch (error) {
    console.error('Failed to grant coin access:', error);
    return false;
  }
};

/**
 * Record access history
 */
export const recordAccessHistory = async (
  userId: string,
  contentId: string,
  method: 'free' | 'subscription' | 'coins' | 'ad'
): Promise<void> => {
  try {
    const historyData = await AsyncStorage.getItem(`${ACCESS_HISTORY_KEY}_${userId}`);
    let history = historyData ? JSON.parse(historyData) : [];
    
    const accessRecord = {
      contentId,
      method,
      timestamp: new Date().toISOString(),
    };
    
    history.unshift(accessRecord);
    
    // Keep only last 500 access records
    if (history.length > 500) {
      history.splice(500);
    }
    
    await AsyncStorage.setItem(`${ACCESS_HISTORY_KEY}_${userId}`, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to record access history:', error);
  }
};

/**
 * Get available coin earning opportunities
 */
export const getEarningOpportunities = async (): Promise<{
  dailyLogin: number;
  watchAd: number;
  shareContent: number;
  inviteFriend: number;
  completeProfile: number;
}> => {
  return {
    dailyLogin: 25,
    watchAd: 10,
    shareContent: 15,
    inviteFriend: 100,
    completeProfile: 50,
  };
};

/**
 * Process daily login bonus
 */
export const processDailyLoginBonus = async (userId: string): Promise<boolean> => {
  try {
    const userCoins = await getUserCoins(userId);
    const today = new Date().toDateString();
    
    // Check if user already got today's bonus
    const todayTransaction = userCoins.transactions.find(
      t => t.description === 'Daily login bonus' && 
           new Date(t.timestamp).toDateString() === today
    );
    
    if (todayTransaction) {
      return false; // Already claimed today
    }
    
    const opportunities = await getEarningOpportunities();
    await addCoins(userId, opportunities.dailyLogin, 'Daily login bonus');
    
    return true;
  } catch (error) {
    console.error('Failed to process daily login bonus:', error);
    return false;
  }
};