/**
 * Coin Service
 * 
 * Manages the virtual currency (coins) system for the app,
 * including purchasing, spending, and tracking coin balances.
 */
import { apiService } from './api';
import { storageService } from './storage';
import { analyticsService } from './analytics';
import { API_CONFIG } from '@/constants/config';
import { CoinPackage, CoinTransaction, ContentPurchase } from '@/types/monetization';
import { AnalyticsEventType } from './analytics';

/**
 * Coin Service Class
 * 
 * Handles all coin-related operations
 */
class CoinService {
  /**
   * Get user's current coin balance
   * 
   * @returns Promise with coin balance
   */
  async getCoinBalance(): Promise<number> {
    try {
      const response = await apiService.get<{ balance: number }>(API_CONFIG.ENDPOINTS.COINS.BALANCE);
      return response.balance;
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      throw error;
    }
  }

  /**
   * Get available coin packages for purchase
   * 
   * @returns Promise with list of coin packages
   */
  async getCoinPackages(): Promise<CoinPackage[]> {
    try {
      return await apiService.get<CoinPackage[]>(`${API_CONFIG.ENDPOINTS.COINS.BUY}/packages`);
    } catch (error) {
      console.error('Error fetching coin packages:', error);
      throw error;
    }
  }

  /**
   * Purchase a coin package
   * 
   * @param packageId ID of the coin package to purchase
   * @param paymentMethodId Payment method ID from payment processor
   * @returns Promise with transaction details
   */
  async purchaseCoinPackage(
    packageId: number,
    paymentMethodId: string
  ): Promise<CoinTransaction> {
    try {
      const transaction = await apiService.post<CoinTransaction>(
        API_CONFIG.ENDPOINTS.COINS.BUY,
        {
          packageId,
          paymentMethodId
        }
      );

      // Track purchase event
      analyticsService.trackEvent(AnalyticsEventType.PURCHASE_COINS, {
        packageId,
        amount: transaction.amount,
        transactionId: transaction.id
      });

      return transaction;
    } catch (error) {
      console.error('Error purchasing coin package:', error);
      throw error;
    }
  }

  /**
   * Purchase content with coins
   * 
   * @param contentId ID of the content to purchase
   * @param contentType Type of content (episode, series, etc.)
   * @param coinAmount Amount of coins to spend
   * @returns Promise with purchase details
   */
  async purchaseContent(
    contentId: number,
    contentType: 'episode' | 'series' | 'movie',
    coinAmount: number
  ): Promise<ContentPurchase> {
    try {
      const purchase = await apiService.post<ContentPurchase>(
        API_CONFIG.ENDPOINTS.COINS.PURCHASE,
        {
          contentId,
          contentType,
          coinAmount
        }
      );

      // Track spend event
      analyticsService.trackEvent(AnalyticsEventType.SPEND_COINS, {
        contentId,
        contentType,
        coinAmount,
        purchaseId: purchase.id
      });

      return purchase;
    } catch (error) {
      console.error('Error purchasing content with coins:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for coins
   * 
   * @param page Page number for pagination
   * @param limit Number of transactions per page
   * @returns Promise with list of transactions
   */
  async getTransactionHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: CoinTransaction[], totalPages: number }> {
    try {
      return await apiService.get<{ transactions: CoinTransaction[], totalPages: number }>(
        API_CONFIG.ENDPOINTS.COINS.HISTORY,
        { page, limit }
      );
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Check if user has enough coins for a purchase
   * 
   * @param requiredAmount Amount of coins needed
   * @returns Promise with boolean indicating if user has enough coins
   */
  async hasEnoughCoins(requiredAmount: number): Promise<boolean> {
    try {
      const balance = await this.getCoinBalance();
      return balance >= requiredAmount;
    } catch (error) {
      console.error('Error checking coin balance:', error);
      return false;
    }
  }

  /**
   * Award coins to user (for completing actions, watching ads, etc.)
   * 
   * @param amount Amount of coins to award
   * @param reason Reason for awarding coins
   * @returns Promise with updated balance
   */
  async awardCoins(amount: number, reason: string): Promise<number> {
    try {
      const response = await apiService.post<{ transaction: CoinTransaction, newBalance: number }>(
        `${API_CONFIG.ENDPOINTS.COINS.BALANCE}/award`,
        { amount, reason }
      );

      // Track reward event
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'coins_awarded',
        amount,
        reason,
        newBalance: response.newBalance
      });

      return response.newBalance;
    } catch (error) {
      console.error('Error awarding coins:', error);
      throw error;
    }
  }

  /**
   * Get content purchases for current user
   * 
   * @returns Promise with list of purchased content
   */
  async getPurchasedContent(): Promise<ContentPurchase[]> {
    try {
      return await apiService.get<ContentPurchase[]>(
        `${API_CONFIG.ENDPOINTS.COINS.PURCHASE}/history`
      );
    } catch (error) {
      console.error('Error fetching purchased content:', error);
      throw error;
    }
  }

  /**
   * Check if user has purchased specific content
   * 
   * @param contentId ID of the content
   * @param contentType Type of content (episode, series, etc.)
   * @returns Promise with boolean indicating if content is purchased
   */
  async hasUserPurchased(
    contentId: number,
    contentType: 'episode' | 'series' | 'movie'
  ): Promise<boolean> {
    try {
      const response = await apiService.get<{ purchased: boolean }>(
        `${API_CONFIG.ENDPOINTS.COINS.PURCHASE}/check`,
        { contentId, contentType }
      );
      return response.purchased;
    } catch (error) {
      console.error('Error checking content purchase:', error);
      return false;
    }
  }
}

export const coinService = new CoinService();