/**
 * Advertising Types
 * 
 * Type definitions for ad providers and advertising system.
 */
import { AdType, AdStatus } from '@/services/advertising';

/**
 * Ad Event Callback Type
 * Function type for ad event callbacks
 */
export type AdEventCallback = (status: AdStatus, data?: any) => void;

/**
 * Ad Instance Interface
 * Represents a loaded ad instance
 */
export interface AdInstance {
  loaded: boolean;
  instance?: any;  // The actual ad instance from the provider's SDK
}

/**
 * Ad Configuration Interface
 * Configuration options for initializing an ad provider
 */
export interface AdConfig {
  appId?: string;
  adUnitIds?: Record<string, string>;
  testMode?: boolean;
  ageRestricted?: boolean;
  maxAdContentRating?: string;
  userTargeting?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    interests?: string[];
    location?: string;
  };
  mediationConfig?: any; // For advanced mediation configuration
}

/**
 * Ad Provider Interface
 * Interface that all ad provider implementations must follow
 */
export interface AdProvider {
  /**
   * Initialize the ad provider SDK
   * 
   * @param config Configuration for the ad provider
   * @returns Promise that resolves with a boolean indicating success
   */
  initialize(config: AdConfig): Promise<boolean>;
  
  /**
   * Load an ad from the provider
   * 
   * @param adType Type of ad to load
   * @returns Promise that resolves with a boolean indicating success
   */
  loadAd(adType: AdType): Promise<boolean>;
  
  /**
   * Show a loaded ad
   * 
   * @param adType Type of ad to show
   * @param options Additional options for showing the ad
   * @returns Promise that resolves with a boolean indicating success
   */
  showAd(adType: AdType, options?: any): Promise<boolean>;
  
  /**
   * Check if an ad is ready to be shown
   * 
   * @param adType Type of ad to check
   * @returns Boolean indicating if the ad is ready
   */
  isAdReady(adType: AdType): boolean;
  
  /**
   * Add a callback for ad events
   * 
   * @param adType Type of ad to listen for
   * @param callback Callback function for ad events
   */
  addCallback(adType: AdType, callback: AdEventCallback): void;
  
  /**
   * Remove a callback for ad events
   * 
   * @param adType Type of ad
   * @param callback Callback to remove
   */
  removeCallback(adType: AdType, callback: AdEventCallback): void;
}

/**
 * Mediation Strategy
 * Strategy for ad network mediation (which network to try first)
 */
export enum MediationStrategy {
  WATERFALL = 'waterfall',  // Try networks in sequence based on priority
  ROUND_ROBIN = 'round_robin', // Rotate through networks evenly
  HIGHEST_PAYING = 'highest_paying', // Use historical eCPM data to choose
  SMART = 'smart' // Let the mediation layer decide based on multiple factors
}

/**
 * Mediation Provider Configuration
 * Configuration for a single provider in the mediation stack
 */
export interface MediationProviderConfig {
  providerId: string;
  priority: number;
  weight: number;
  minTimeInterval: number; // Minimum time between ads from this provider (ms)
  adUnitIds: Record<string, string>;
  enabled: boolean;
}

/**
 * Mediation Configuration
 * Complete configuration for ad mediation
 */
export interface MediationConfig {
  strategy: MediationStrategy;
  providers: MediationProviderConfig[];
  fallbackProvider: string; // Provider to use if all others fail
  timeoutMs: number; // How long to wait before trying next provider
  refreshIntervalMs: number; // How often to refresh the mediation stack
}