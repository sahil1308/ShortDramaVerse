/**
 * Advertising Service
 * 
 * Manages in-app advertisements, including displaying ads,
 * tracking ad views, and rewarding users for watching ads.
 */
import { apiService } from './api';
import { coinService } from './coin';
import { analyticsService } from './analytics';
import { API_CONFIG } from '@/constants/config';
import { Advertisement, AdViewingRecord } from '@/types/monetization';
import { AnalyticsEventType } from './analytics';

/**
 * Ad Status Enum
 * Different possible states of an ad
 */
export enum AdStatus {
  LOADING = 'loading',
  READY = 'ready',
  SHOWING = 'showing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NOT_AVAILABLE = 'not_available',
  SKIPPED = 'skipped'
}

/**
 * Ad Type Enum
 * Different types of advertisements
 */
export enum AdType {
  BANNER = 'banner',
  INTERSTITIAL = 'interstitial',
  REWARDED = 'rewarded',
  NATIVE = 'native'
}

/**
 * Ad Event Listener Type
 * For ad event callbacks
 */
export type AdEventListener = (status: AdStatus, data?: any) => void;

/**
 * Advertising Service Class
 * 
 * Handles operations related to displaying and tracking advertisements
 */
class AdvertisingService {
  private adProviders: any = {}; // Will hold references to ad provider SDKs
  private adUnits: Record<string, string> = {}; // Ad unit IDs for different ad types
  private listeners: Record<string, AdEventListener[]> = {};
  private lastAdTime: Record<string, number> = {}; // Track when ads were last shown
  private isAdLoading: Record<string, boolean> = {}; // Track ad loading state
  
  /**
   * Initialize the advertising service
   * 
   * @param adUnitIds Object containing ad unit IDs for different types
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(adUnitIds: Record<string, string>): Promise<void> {
    try {
      this.adUnits = adUnitIds;
      
      // This would normally initialize the actual ad SDKs
      // In a real implementation, this would use something like
      // AdMob, Facebook Ads, or other mobile ad providers
      
      // For example: AdMob.initialize()
      
      // Track ad types
      Object.keys(AdType).forEach(type => {
        this.lastAdTime[type] = 0;
        this.isAdLoading[type] = false;
        this.listeners[type] = [];
      });
      
      console.log('Advertising service initialized');
    } catch (error) {
      console.error('Error initializing advertising service:', error);
      throw error;
    }
  }
  
  /**
   * Add listener for ad events
   * 
   * @param adType Type of ad to listen for
   * @param listener Callback function for ad events
   */
  addListener(adType: AdType, listener: AdEventListener): void {
    if (!this.listeners[adType]) {
      this.listeners[adType] = [];
    }
    this.listeners[adType].push(listener);
  }
  
  /**
   * Remove listener for ad events
   * 
   * @param adType Type of ad the listener is for
   * @param listener Listener to remove
   */
  removeListener(adType: AdType, listener: AdEventListener): void {
    if (this.listeners[adType]) {
      this.listeners[adType] = this.listeners[adType].filter(l => l !== listener);
    }
  }
  
  /**
   * Notify all listeners of an ad event
   * 
   * @param adType Type of ad event
   * @param status Status of the ad
   * @param data Additional data about the event
   */
  private notifyListeners(adType: AdType, status: AdStatus, data?: any): void {
    if (this.listeners[adType]) {
      this.listeners[adType].forEach(listener => {
        try {
          listener(status, data);
        } catch (error) {
          console.error('Error in ad listener:', error);
        }
      });
    }
  }
  
  /**
   * Load an advertisement
   * 
   * @param adType Type of ad to load
   * @returns Promise that resolves when ad is loaded
   */
  async loadAd(adType: AdType): Promise<boolean> {
    try {
      if (this.isAdLoading[adType]) {
        return false; // Already loading
      }
      
      this.isAdLoading[adType] = true;
      this.notifyListeners(adType, AdStatus.LOADING);
      
      // This would be replaced with actual ad SDK calls
      // For example: await AdMob.loadInterstitial()
      
      // Simulate ad loading with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isAdLoading[adType] = false;
      this.notifyListeners(adType, AdStatus.READY);
      
      return true;
    } catch (error) {
      console.error(`Error loading ${adType} ad:`, error);
      this.isAdLoading[adType] = false;
      this.notifyListeners(adType, AdStatus.FAILED, { error });
      return false;
    }
  }
  
  /**
   * Show an advertisement
   * 
   * @param adType Type of ad to show
   * @param options Additional options for the ad
   * @returns Promise that resolves when ad is shown or fails
   */
  async showAd(adType: AdType, options: any = {}): Promise<boolean> {
    try {
      // Check minimum time between ads
      const now = Date.now();
      const minInterval = options.minInterval || 30000; // Default 30 seconds
      
      if (now - this.lastAdTime[adType] < minInterval) {
        console.log(`Too soon to show another ${adType} ad`);
        return false;
      }
      
      // Load ad if not ready
      if (!this.isAdReady(adType)) {
        const loaded = await this.loadAd(adType);
        if (!loaded) {
          return false;
        }
      }
      
      this.notifyListeners(adType, AdStatus.SHOWING);
      
      // This would be replaced with actual ad SDK calls
      // For example: await AdMob.showInterstitial()
      
      // Simulate showing ad
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.lastAdTime[adType] = Date.now();
      
      // For rewarded ads, handle reward
      if (adType === AdType.REWARDED) {
        await this.handleRewardedAdCompletion(options.contentId, options.contentType);
      }
      
      // Track ad view
      await this.trackAdView(adType, true, options.contentId, options.contentType);
      
      this.notifyListeners(adType, AdStatus.COMPLETED);
      
      return true;
    } catch (error) {
      console.error(`Error showing ${adType} ad:`, error);
      this.notifyListeners(adType, AdStatus.FAILED, { error });
      return false;
    }
  }
  
  /**
   * Check if an ad is ready to be shown
   * 
   * @param adType Type of ad to check
   * @returns Boolean indicating if ad is ready
   */
  isAdReady(adType: AdType): boolean {
    // This would check with the actual ad SDK
    // For example: return AdMob.isInterstitialReady()
    
    // Simple implementation for now
    return !this.isAdLoading[adType];
  }
  
  /**
   * Track an ad view in the backend
   * 
   * @param adType Type of ad viewed
   * @param completed Whether the ad was viewed to completion
   * @param contentId ID of content related to the ad (if applicable)
   * @param contentType Type of content related to the ad (if applicable)
   */
  private async trackAdView(
    adType: AdType,
    completed: boolean,
    contentId?: number,
    contentType?: string
  ): Promise<void> {
    try {
      // Track ad view in analytics
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'ad_viewed',
        adType,
        completed,
        contentId,
        contentType
      });
      
      // Send to backend if needed
      await apiService.post('/api/ads/track-view', {
        adType,
        completed,
        contentId,
        contentType
      });
    } catch (error) {
      console.error('Error tracking ad view:', error);
    }
  }
  
  /**
   * Handle rewarded ad completion
   * 
   * @param contentId ID of content to unlock (if applicable)
   * @param contentType Type of content to unlock (if applicable)
   */
  private async handleRewardedAdCompletion(
    contentId?: number,
    contentType?: string
  ): Promise<void> {
    try {
      // Award coins or unlock content
      if (contentId && contentType) {
        // Unlock content through ad viewing
        await apiService.post('/api/ads/unlock-content', {
          contentId,
          contentType
        });
      } else {
        // Award coins as general reward
        const coinReward = 5; // This could be fetched from backend
        await coinService.awardCoins(coinReward, 'Watched rewarded ad');
      }
    } catch (error) {
      console.error('Error handling rewarded ad completion:', error);
    }
  }
  
  /**
   * Check if user needs to watch an ad to access content
   * 
   * @param contentId ID of the content
   * @param contentType Type of the content
   * @returns Promise with boolean indicating if ad is required
   */
  async isAdRequiredForContent(
    contentId: number,
    contentType: string
  ): Promise<boolean> {
    try {
      const response = await apiService.get<{ adRequired: boolean }>(
        '/api/ads/check-required',
        { contentId, contentType }
      );
      return response.adRequired;
    } catch (error) {
      console.error('Error checking if ad is required:', error);
      return false;
    }
  }
  
  /**
   * Get statistics about ads viewed by the user
   * 
   * @returns Promise with ad viewing statistics
   */
  async getAdStats(): Promise<{
    totalAdsWatched: number,
    rewardedAdsWatched: number,
    contentUnlocked: number
  }> {
    try {
      return await apiService.get<{
        totalAdsWatched: number,
        rewardedAdsWatched: number,
        contentUnlocked: number
      }>('/api/ads/stats');
    } catch (error) {
      console.error('Error fetching ad stats:', error);
      return {
        totalAdsWatched: 0,
        rewardedAdsWatched: 0,
        contentUnlocked: 0
      };
    }
  }
}

export const advertisingService = new AdvertisingService();