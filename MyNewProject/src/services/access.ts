/**
 * Access Control Service
 * 
 * Manages content access permissions, determining whether
 * a user can access premium content based on subscriptions,
 * coin purchases, or ad viewing.
 */
import { apiService } from './api';
import { subscriptionService } from './subscription';
import { coinService } from './coin';
import { advertisingService, AdType } from './advertising';
import { analyticsService } from './analytics';
import { API_CONFIG } from '@/constants/config';
import { AccessControl, FreeTrialConfiguration } from '@/types/monetization';
import { Episode } from '@/types/drama';
import { AnalyticsEventType } from './analytics';

/**
 * Content Access Type Enum
 * Different ways content can be accessed
 */
export enum ContentAccessType {
  FREE = 'free',
  SUBSCRIPTION = 'subscription',
  COIN = 'coin',
  AD = 'ad',
  LOCKED = 'locked'
}

/**
 * Content Access Result Interface
 * Information about content access status
 */
interface ContentAccessResult {
  canAccess: boolean;
  accessType: ContentAccessType;
  coinCost?: number;
  requiredSubscription?: string;
  adRequired?: boolean;
  message?: string;
  previewDuration?: number;
}

/**
 * Access Control Service Class
 * 
 * Handles checking and granting access to premium content
 */
class AccessControlService {
  /**
   * Check if a user can access specific content
   * 
   * @param contentId ID of the content to check
   * @param contentType Type of the content (episode, series, etc.)
   * @returns Promise with content access details
   */
  async checkContentAccess(
    contentId: number,
    contentType: 'episode' | 'series' | 'movie'
  ): Promise<ContentAccessResult> {
    try {
      // First check if the content is free
      const contentInfo = await apiService.get<AccessControl>('/api/access/check', {
        contentId,
        contentType
      });
      
      // If content is free, allow access immediately
      if (contentInfo.accessType === 'free') {
        return {
          canAccess: true,
          accessType: ContentAccessType.FREE,
          message: 'Free content'
        };
      }
      
      // Check if user has already purchased this content
      const isPurchased = await coinService.hasUserPurchased(contentId, contentType);
      if (isPurchased) {
        return {
          canAccess: true,
          accessType: ContentAccessType.COIN,
          message: 'Already purchased'
        };
      }
      
      // Check subscription access
      if (contentInfo.accessType === 'subscription') {
        const hasPremium = await subscriptionService.hasPremiumAccess();
        if (hasPremium) {
          return {
            canAccess: true,
            accessType: ContentAccessType.SUBSCRIPTION,
            message: 'Access granted via subscription'
          };
        }
        
        // If not subscribed, return subscription requirements
        return {
          canAccess: false,
          accessType: ContentAccessType.SUBSCRIPTION,
          requiredSubscription: contentInfo.requiredSubscriptionLevel || 'premium',
          message: 'Subscription required',
          previewDuration: await this.getPreviewDuration(contentId, contentType)
        };
      }
      
      // Check coin-based access
      if (contentInfo.accessType === 'coin') {
        const hasEnough = await coinService.hasEnoughCoins(contentInfo.coinCost || 0);
        return {
          canAccess: hasEnough,
          accessType: ContentAccessType.COIN,
          coinCost: contentInfo.coinCost || 0,
          message: hasEnough ? 'Can purchase with coins' : 'Not enough coins',
          previewDuration: hasEnough ? undefined : await this.getPreviewDuration(contentId, contentType)
        };
      }
      
      // Check ad-based access
      if (contentInfo.accessType === 'ad') {
        return {
          canAccess: true, // User can potentially access by watching an ad
          accessType: ContentAccessType.AD,
          adRequired: true,
          message: 'Watch ad to unlock'
        };
      }
      
      // Default to locked
      return {
        canAccess: false,
        accessType: ContentAccessType.LOCKED,
        message: 'Content is not available'
      };
    } catch (error) {
      console.error('Error checking content access:', error);
      // Default to locked on error
      return {
        canAccess: false,
        accessType: ContentAccessType.LOCKED,
        message: 'Error checking access'
      };
    }
  }
  
  /**
   * Purchase content access with coins
   * 
   * @param contentId ID of the content to purchase
   * @param contentType Type of the content
   * @returns Promise with purchase result
   */
  async purchaseContentAccess(
    contentId: number,
    contentType: 'episode' | 'series' | 'movie'
  ): Promise<boolean> {
    try {
      // Check access first to get coin cost
      const accessInfo = await this.checkContentAccess(contentId, contentType);
      
      if (accessInfo.accessType !== ContentAccessType.COIN) {
        console.error('Content does not support coin purchase');
        return false;
      }
      
      if (!accessInfo.coinCost) {
        console.error('No coin cost specified');
        return false;
      }
      
      // Purchase with coins
      await coinService.purchaseContent(contentId, contentType, accessInfo.coinCost);
      
      // Track purchase in analytics
      analyticsService.trackEvent(AnalyticsEventType.SPEND_COINS, {
        contentId,
        contentType,
        coinAmount: accessInfo.coinCost
      });
      
      return true;
    } catch (error) {
      console.error('Error purchasing content access:', error);
      return false;
    }
  }
  
  /**
   * Unlock content by watching an advertisement
   * 
   * @param contentId ID of the content to unlock
   * @param contentType Type of the content
   * @returns Promise with unlock result
   */
  async unlockContentWithAd(
    contentId: number,
    contentType: 'episode' | 'series' | 'movie'
  ): Promise<boolean> {
    try {
      // Check if ad is required
      const accessInfo = await this.checkContentAccess(contentId, contentType);
      
      if (accessInfo.accessType !== ContentAccessType.AD) {
        console.error('Content does not support ad-based access');
        return false;
      }
      
      // Show a rewarded ad
      const adShown = await advertisingService.showAd(
        AdType.REWARDED,
        { contentId, contentType }
      );
      
      if (!adShown) {
        console.error('Failed to show rewarded ad');
        return false;
      }
      
      // Track unlock in analytics
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'content_unlocked_with_ad',
        contentId,
        contentType
      });
      
      return true;
    } catch (error) {
      console.error('Error unlocking content with ad:', error);
      return false;
    }
  }
  
  /**
   * Get free episodes for a series
   * 
   * @param seriesId ID of the series
   * @returns Promise with list of free episode IDs
   */
  async getFreeEpisodes(seriesId: number): Promise<number[]> {
    try {
      const config = await apiService.get<FreeTrialConfiguration>(
        '/api/access/free-trial-config',
        { seriesId }
      );
      
      if (config.freeEpisodeStrategy === 'specific' && config.specificFreeEpisodeIds) {
        return config.specificFreeEpisodeIds;
      }
      
      if (config.freeEpisodeStrategy === 'sequential') {
        // For sequential, get the first N episodes
        const episodes = await apiService.get<Episode[]>(
          API_CONFIG.ENDPOINTS.SERIES.EPISODES(seriesId)
        );
        
        return episodes
          .sort((a, b) => a.episodeNumber - b.episodeNumber)
          .slice(0, config.totalFreeEpisodes)
          .map(episode => episode.id);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting free episodes:', error);
      return [];
    }
  }
  
  /**
   * Check if an episode is free
   * 
   * @param episodeId ID of the episode
   * @param seriesId ID of the series
   * @returns Promise with boolean indicating if episode is free
   */
  async isEpisodeFree(episodeId: number, seriesId: number): Promise<boolean> {
    try {
      const freeEpisodes = await this.getFreeEpisodes(seriesId);
      return freeEpisodes.includes(episodeId);
    } catch (error) {
      console.error('Error checking if episode is free:', error);
      return false;
    }
  }
  
  /**
   * Get preview duration for premium content
   * 
   * @param contentId ID of the content
   * @param contentType Type of the content
   * @returns Promise with preview duration in seconds (0 if no preview)
   */
  private async getPreviewDuration(
    contentId: number,
    contentType: 'episode' | 'series' | 'movie'
  ): Promise<number> {
    try {
      if (contentType !== 'episode') {
        return 0; // Only episodes have previews
      }
      
      // Get episode details to find the series
      const episode = await apiService.get<Episode>(
        API_CONFIG.ENDPOINTS.EPISODES.DETAILS(contentId)
      );
      
      // Get series free trial configuration
      const config = await apiService.get<FreeTrialConfiguration>(
        '/api/access/free-trial-config',
        { seriesId: episode.seriesId }
      );
      
      return config.previewDuration || 0;
    } catch (error) {
      console.error('Error getting preview duration:', error);
      return 0;
    }
  }
}

export const accessControlService = new AccessControlService();