/**
 * Subscription Service
 * 
 * Handles all operations related to user subscriptions,
 * including managing plans, processing payments, and
 * checking subscription status.
 */
import { apiService } from './api';
import { storageService } from './storage';
import { analyticsService } from './analytics';
import { API_CONFIG } from '@/constants/config';
import { SubscriptionPlan, UserSubscription } from '@/types/monetization';
import { AnalyticsEventType } from './analytics';

/**
 * Subscription Service Class
 * 
 * Manages user subscriptions and plans
 */
class SubscriptionService {
  /**
   * Get all available subscription plans
   * 
   * @returns Promise with list of subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await apiService.get<SubscriptionPlan[]>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get active subscription for current user
   * 
   * @returns Promise with user subscription or null if none
   */
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      return await apiService.get<UserSubscription | null>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.STATUS);
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }

  /**
   * Subscribe user to a plan
   * 
   * @param planId ID of the plan to subscribe to
   * @param paymentMethodId Payment method ID from payment processor
   * @returns Promise with the new subscription
   */
  async subscribeToPlan(planId: number, paymentMethodId: string): Promise<UserSubscription> {
    try {
      const subscription = await apiService.post<UserSubscription>(
        API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUBSCRIBE,
        {
          planId,
          paymentMethodId
        }
      );

      // Track subscription event
      analyticsService.trackEvent(AnalyticsEventType.PURCHASE_SUBSCRIPTION, {
        planId,
        subscriptionId: subscription.id
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  }

  /**
   * Cancel active subscription
   * 
   * @param endImmediately Whether to end subscription immediately or at the end of current period
   * @returns Promise with updated subscription
   */
  async cancelSubscription(endImmediately: boolean = false): Promise<UserSubscription> {
    try {
      const subscription = await apiService.post<UserSubscription>(
        API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL,
        { endImmediately }
      );

      // Track cancellation event
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'subscription_cancelled',
        subscriptionId: subscription.id,
        endImmediately
      });

      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Check if user can access premium content
   * 
   * @returns Promise with boolean indicating premium access
   */
  async hasPremiumAccess(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription !== null && subscription.status === 'active';
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }

  /**
   * Get subscription details for a specific user
   * 
   * @param userId User ID to get subscription for
   * @returns Promise with user subscription
   */
  async getUserSubscription(userId: number): Promise<UserSubscription | null> {
    try {
      return await apiService.get<UserSubscription | null>(
        `${API_CONFIG.ENDPOINTS.SUBSCRIPTION.STATUS}/${userId}`
      );
    } catch (error) {
      console.error(`Error fetching subscription for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Check if user is in trial period
   * 
   * @returns Promise with boolean indicating trial status
   */
  async isInTrialPeriod(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      return subscription !== null && subscription.status === 'trial';
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Get days remaining in current subscription period
   * 
   * @returns Promise with number of days remaining or 0 if no subscription
   */
  async getDaysRemaining(): Promise<number> {
    try {
      const subscription = await this.getCurrentSubscription();
      
      if (!subscription || subscription.status !== 'active') {
        return 0;
      }
      
      const endDate = new Date(subscription.endDate);
      const now = new Date();
      
      // Calculate days remaining
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 0;
    }
  }

  /**
   * Get subscription history for the current user
   * 
   * @returns Promise with list of historical subscriptions
   */
  async getSubscriptionHistory(): Promise<UserSubscription[]> {
    try {
      return await apiService.get<UserSubscription[]>(
        `${API_CONFIG.ENDPOINTS.SUBSCRIPTION.STATUS}/history`
      );
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }
  }
}

export const subscriptionService = new SubscriptionService();