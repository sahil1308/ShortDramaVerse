/**
 * Advertising Service
 * 
 * Manages in-app advertisements, including displaying ads,
 * tracking ad views, and rewarding users for watching ads.
 * 
 * Integrates with AdMob and AppLovin through the ad mediation service.
 */
import { apiService } from './api';
import { coinService } from './coin';
import { analyticsService } from './analytics';
import { API_CONFIG } from '@/constants/config';
import { Advertisement, AdViewingRecord } from '@/types/monetization';
import { AnalyticsEventType } from './analytics';
import { adMediationService, AdProviderType } from './adProviders/adMediationService';
import { AdEventCallback } from '@/types/advertising';
import { __DEV__ } from './constants';

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
 * using the ad mediation service to manage multiple ad providers
 */
class AdvertisingService {
  private listeners: Record<string, AdEventListener[]> = {};
  private lastAdTime: Record<string, number> = {}; // Track when ads were last shown
  private initialized: boolean = false;
  
  /**
   * Initialize the advertising service
   * 
   * @param config Configuration object with settings for each ad network
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(config: {
    admob?: { appId?: string, adUnitIds?: Record<string, string> },
    applovin?: { sdkKey?: string, adUnitIds?: Record<string, string> }
  }): Promise<void> {
    try {
      // Skip if already initialized
      if (this.initialized) {
        return;
      }
      
      // Set up listener tracking
      Object.values(AdType).forEach(type => {
        this.lastAdTime[type] = 0;
        this.listeners[type] = [];
      });
      
      // Set up mediation config
      const mediationConfig = {
        admob: {
          appId: config.admob?.appId,
          adUnitIds: config.admob?.adUnitIds || {},
          testMode: __DEV__
        },
        applovin: {
          appId: config.applovin?.sdkKey,
          adUnitIds: config.applovin?.adUnitIds || {},
          testMode: __DEV__
        }
      };
      
      // Initialize ad mediation service
      await adMediationService.initialize(mediationConfig);
      
      // Add callbacks from mediation service to our listeners
      Object.values(AdType).forEach(type => {
        adMediationService.addCallback(type, (status, data) => {
          this.notifyListeners(type, status, data);
          
          // If the ad was completed, handle rewarded ad completion
          if (status === AdStatus.COMPLETED && type === AdType.REWARDED && data?.reward) {
            this.handleRewardedAdCompletion(data.contentId, data.contentType)
              .catch(error => console.error('Error handling reward:', error));
          }
          
          // Track ad view on completion or failure
          if (status === AdStatus.COMPLETED || status === AdStatus.FAILED) {
            this.trackAdView(
              type, 
              status === AdStatus.COMPLETED,
              data?.contentId,
              data?.contentType
            ).catch(error => console.error('Error tracking ad view:', error));
          }
        });
      });
      
      // Pre-load interstitial and rewarded ads
      await Promise.all([
        adMediationService.loadAd(AdType.INTERSTITIAL),
        adMediationService.loadAd(AdType.REWARDED)
      ]);
      
      this.initialized = true;
      console.log('Advertising service initialized with AdMob and AppLovin');
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
      if (!this.initialized) {
        console.error('Ad service not initialized');
        this.notifyListeners(adType, AdStatus.FAILED, { error: 'Not initialized' });
        return false;
      }
      
      // Forward to mediation service
      return await adMediationService.loadAd(adType);
    } catch (error) {
      console.error(`Error loading ${adType} ad:`, error);
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
      if (!this.initialized) {
        console.error('Ad service not initialized');
        return false;
      }
      
      // Check minimum time between ads
      const now = Date.now();
      const minInterval = options.minInterval || 30000; // Default 30 seconds
      
      if (now - this.lastAdTime[adType] < minInterval) {
        console.log(`Too soon to show another ${adType} ad`);
        return false;
      }
      
      // Update last ad time
      this.lastAdTime[adType] = now;
      
      // Forward to mediation service with content info
      return await adMediationService.showAd(adType, {
        ...options,
        contentId: options.contentId,
        contentType: options.contentType
      });
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
    if (!this.initialized) {
      return false;
    }
    
    return adMediationService.isAdReady(adType);
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