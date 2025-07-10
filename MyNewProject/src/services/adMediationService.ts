/**
 * Ad Mediation Service
 * 
 * Manages multiple ad providers and mediates between them to
 * optimize ad fill rates and revenue.
 */
import { AdType, AdStatus } from '../advertising';
import { AdProvider, AdConfig, AdEventCallback, MediationStrategy, MediationConfig } from '@/types/advertising';
import { adMobProvider } from './adMobProvider';
import { appLovinProvider } from './appLovinProvider';
import { analyticsService } from '../analytics';
import { AnalyticsEventType } from '../analytics';

/**
 * Supported Ad Providers
 */
export enum AdProviderType {
  ADMOB = 'admob',
  APPLOVIN = 'applovin'
}

/**
 * Ad Mediation Service Class
 * 
 * Manages multiple ad providers and mediates between them
 */
export class AdMediationService implements AdProvider {
  private initialized: boolean = false;
  private providers: Record<string, AdProvider> = {};
  private activeProvidersByType: Record<string, string> = {};
  private mediationConfig: MediationConfig | null = null;
  private callbacks: Record<string, AdEventCallback[]> = {};
  private loadInProgress: Record<string, boolean> = {};
  private timeout: Record<string, NodeJS.Timeout> = {};
  
  constructor() {
    this.providers = {
      [AdProviderType.ADMOB]: adMobProvider,
      [AdProviderType.APPLOVIN]: appLovinProvider
    };
    
    // Initialize callbacks
    this.callbacks = {
      [AdType.BANNER]: [],
      [AdType.INTERSTITIAL]: [],
      [AdType.REWARDED]: [],
      [AdType.NATIVE]: [],
    };
    
    // Initialize load in progress flags
    this.loadInProgress = {
      [AdType.BANNER]: false,
      [AdType.INTERSTITIAL]: false,
      [AdType.REWARDED]: false,
      [AdType.NATIVE]: false,
    };
  }
  
  /**
   * Initialize the mediation service and all providers
   * 
   * @param config Configuration for all providers
   * @param mediationConfig Mediation configuration
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(config: Record<string, AdConfig>, mediationConfig?: MediationConfig): Promise<boolean> {
    try {
      if (this.initialized) {
        return true;
      }
      
      // Store mediation config
      this.mediationConfig = mediationConfig || {
        strategy: MediationStrategy.WATERFALL,
        providers: [
          {
            providerId: AdProviderType.ADMOB,
            priority: 1,
            weight: 70,
            minTimeInterval: 0,
            adUnitIds: {},
            enabled: true
          },
          {
            providerId: AdProviderType.APPLOVIN,
            priority: 2,
            weight: 30,
            minTimeInterval: 0,
            adUnitIds: {},
            enabled: true
          }
        ],
        fallbackProvider: AdProviderType.ADMOB,
        timeoutMs: 10000,
        refreshIntervalMs: 300000
      };
      
      // Initialize all providers
      let initPromises = [];
      for (const [providerId, provider] of Object.entries(this.providers)) {
        const providerConfig = config[providerId] || {};
        
        // Find provider in mediation config
        const providerMediationConfig = this.mediationConfig.providers.find(
          p => p.providerId === providerId
        );
        
        // Skip disabled providers
        if (providerMediationConfig && !providerMediationConfig.enabled) {
          continue;
        }
        
        // If we have ad unit IDs in the mediation config, use those
        if (providerMediationConfig && providerMediationConfig.adUnitIds) {
          providerConfig.adUnitIds = {
            ...providerConfig.adUnitIds,
            ...providerMediationConfig.adUnitIds
          };
        }
        
        initPromises.push(provider.initialize(providerConfig));
      }
      
      // Wait for all providers to initialize
      const results = await Promise.all(initPromises);
      
      // If any provider failed to initialize, log it but continue
      if (results.includes(false)) {
        console.warn('One or more ad providers failed to initialize');
      }
      
      // Set initialized flag
      this.initialized = true;
      
      // Track initialization in analytics
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'ad_mediation_initialized',
        providers: Object.keys(this.providers)
      });
      
      console.log('Ad mediation service initialized');
      
      return true;
    } catch (error) {
      console.error('Error initializing ad mediation service:', error);
      return false;
    }
  }
  
  /**
   * Load an ad using the mediation strategy
   * 
   * @param adType The type of ad to load
   * @returns Promise that resolves with a boolean indicating success
   */
  async loadAd(adType: AdType): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.error('Ad mediation service not initialized');
        this.notifyCallbacks(adType, AdStatus.FAILED, { error: 'Not initialized' });
        return false;
      }
      
      // Skip if already in progress
      if (this.loadInProgress[adType]) {
        return false;
      }
      
      this.loadInProgress[adType] = true;
      
      // Notify loading started
      this.notifyCallbacks(adType, AdStatus.LOADING);
      
      // Get provider IDs ordered according to mediation strategy
      const providerIds = this.getOrderedProviderIds(adType);
      
      // Try each provider in order
      for (const providerId of providerIds) {
        const provider = this.providers[providerId];
        
        // Skip if provider doesn't exist
        if (!provider) {
          continue;
        }
        
        try {
          // Set timeout for this provider load attempt
          const timeoutMs = this.mediationConfig?.timeoutMs || 10000;
          const timeoutPromise = new Promise<boolean>((_, reject) => {
            this.timeout[adType] = setTimeout(() => {
              reject(new Error(`Ad load timeout for ${providerId}`));
            }, timeoutMs);
          });
          
          // Try to load ad from this provider
          const result = await Promise.race([
            provider.loadAd(adType),
            timeoutPromise
          ]);
          
          // Clear timeout
          clearTimeout(this.timeout[adType]);
          
          if (result) {
            // Ad loaded successfully
            this.activeProvidersByType[adType] = providerId;
            this.loadInProgress[adType] = false;
            this.notifyCallbacks(adType, AdStatus.READY);
            
            // Track successful provider
            analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
              name: 'ad_mediation_success',
              providerId,
              adType
            });
            
            return true;
          }
        } catch (error) {
          console.warn(`Error loading ad from ${providerId}:`, error);
          // Continue to next provider
        }
      }
      
      // If we get here, all providers failed
      this.loadInProgress[adType] = false;
      this.notifyCallbacks(adType, AdStatus.FAILED, { error: 'All providers failed' });
      
      return false;
    } catch (error) {
      console.error(`Error in ad mediation loadAd for ${adType}:`, error);
      this.loadInProgress[adType] = false;
      this.notifyCallbacks(adType, AdStatus.FAILED, { error });
      return false;
    }
  }
  
  /**
   * Show an ad using the active provider for this ad type
   * 
   * @param adType The type of ad to show
   * @param options Additional options for showing the ad
   * @returns Promise that resolves with a boolean indicating success
   */
  async showAd(adType: AdType, options: any = {}): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.error('Ad mediation service not initialized');
        return false;
      }
      
      // Get the active provider for this ad type
      const activeProviderId = this.activeProvidersByType[adType];
      
      // If no active provider, try to find any ready provider
      if (!activeProviderId) {
        // Try each provider in priority order
        const providerIds = this.getOrderedProviderIds(adType);
        
        for (const providerId of providerIds) {
          const provider = this.providers[providerId];
          
          if (provider && provider.isAdReady(adType)) {
            this.activeProvidersByType[adType] = providerId;
            break;
          }
        }
      }
      
      // If still no active provider, try to load an ad
      if (!this.activeProvidersByType[adType]) {
        const loaded = await this.loadAd(adType);
        if (!loaded) {
          console.error(`No ad available to show for ${adType}`);
          return false;
        }
      }
      
      // Get the provider and show the ad
      const providerId = this.activeProvidersByType[adType];
      const provider = this.providers[providerId];
      
      if (!provider) {
        console.error(`Provider ${providerId} not found`);
        return false;
      }
      
      // Create a forwarding callback to pass events from the provider to our callbacks
      const forwardingCallback = (status: AdStatus, data?: any) => {
        this.notifyCallbacks(adType, status, data);
        
        // If the ad is completed or failed, clear the active provider
        if (status === AdStatus.COMPLETED || status === AdStatus.FAILED) {
          delete this.activeProvidersByType[adType];
          
          // Remove the forwarding callback
          provider.removeCallback(adType, forwardingCallback);
          
          // Preload the next ad after a short delay
          setTimeout(() => {
            this.loadAd(adType).catch(console.error);
          }, 1000);
        }
      };
      
      // Add the forwarding callback
      provider.addCallback(adType, forwardingCallback);
      
      // Show the ad
      return await provider.showAd(adType, options);
    } catch (error) {
      console.error(`Error in ad mediation showAd for ${adType}:`, error);
      return false;
    }
  }
  
  /**
   * Check if an ad is ready to be shown
   * 
   * @param adType The type of ad to check
   * @returns Boolean indicating if the ad is ready
   */
  isAdReady(adType: AdType): boolean {
    if (!this.initialized) {
      return false;
    }
    
    // Check if we have an active provider for this ad type
    const activeProviderId = this.activeProvidersByType[adType];
    
    if (activeProviderId) {
      const provider = this.providers[activeProviderId];
      return provider ? provider.isAdReady(adType) : false;
    }
    
    // If no active provider, check all providers
    for (const providerId of Object.keys(this.providers)) {
      const provider = this.providers[providerId];
      
      if (provider && provider.isAdReady(adType)) {
        this.activeProvidersByType[adType] = providerId;
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add a callback for ad events
   * 
   * @param adType The type of ad to listen for
   * @param callback The callback to call on events
   */
  addCallback(adType: AdType, callback: AdEventCallback): void {
    if (!this.callbacks[adType]) {
      this.callbacks[adType] = [];
    }
    
    this.callbacks[adType].push(callback);
  }
  
  /**
   * Remove a callback for ad events
   * 
   * @param adType The type of ad
   * @param callback The callback to remove
   */
  removeCallback(adType: AdType, callback: AdEventCallback): void {
    if (this.callbacks[adType]) {
      this.callbacks[adType] = this.callbacks[adType].filter(cb => cb !== callback);
    }
  }
  
  /**
   * Get provider IDs ordered according to the current mediation strategy
   * 
   * @param adType The type of ad to get providers for
   * @returns Array of provider IDs in the order they should be tried
   */
  private getOrderedProviderIds(adType: AdType): string[] {
    if (!this.mediationConfig) {
      return Object.keys(this.providers);
    }
    
    const strategy = this.mediationConfig.strategy;
    let providers = [...this.mediationConfig.providers]
      .filter(p => p.enabled);
    
    switch (strategy) {
      case MediationStrategy.WATERFALL:
        // Sort by priority (lower number = higher priority)
        return providers
          .sort((a, b) => a.priority - b.priority)
          .map(p => p.providerId);
        
      case MediationStrategy.ROUND_ROBIN:
        // Simple round robin: just rotate the array
        // In a real implementation, we would track the last used provider
        const lastIndex = Math.floor(Math.random() * providers.length);
        const rotated = [
          ...providers.slice(lastIndex),
          ...providers.slice(0, lastIndex)
        ];
        return rotated.map(p => p.providerId);
        
      case MediationStrategy.HIGHEST_PAYING:
        // In a real implementation, this would use historical eCPM data
        // For now, just use weight as a proxy for eCPM
        return providers
          .sort((a, b) => b.weight - a.weight)
          .map(p => p.providerId);
        
      case MediationStrategy.SMART:
        // Smart would use a combination of factors
        // For now, use a weighted random approach
        const totalWeight = providers.reduce((sum, p) => sum + p.weight, 0);
        providers = providers.sort(() => {
          // Weighted random sort
          const rand = Math.random() * totalWeight;
          let runningSum = 0;
          for (const p of providers) {
            runningSum += p.weight;
            if (rand <= runningSum) {
              return -1;
            }
          }
          return 1;
        });
        return providers.map(p => p.providerId);
        
      default:
        // Default to waterfall
        return providers
          .sort((a, b) => a.priority - b.priority)
          .map(p => p.providerId);
    }
  }
  
  /**
   * Notify all callbacks for an ad type
   * 
   * @param adType The type of ad
   * @param status The new status
   * @param data Additional data
   */
  private notifyCallbacks(adType: AdType, status: AdStatus, data?: any): void {
    if (this.callbacks[adType]) {
      this.callbacks[adType].forEach(callback => {
        try {
          callback(status, data);
        } catch (error) {
          console.error('Error in ad mediation callback:', error);
        }
      });
    }
  }
}

// Create and export a singleton instance
export const adMediationService = new AdMediationService();