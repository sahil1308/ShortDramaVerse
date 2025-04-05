/**
 * Analytics Service
 * 
 * Handles tracking and analytics functionality for the application.
 * Provides a unified interface for tracking events, sessions, and user behavior.
 */

/**
 * Analytics Event Types Enum
 * Standardized event types for consistent tracking
 */
export enum AnalyticsEventType {
  // App lifecycle events
  APP_OPEN = 'app_open',
  APP_CLOSE = 'app_close',
  SCREEN_VIEW = 'screen_view',
  
  // User events
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // Content events
  CONTENT_VIEW = 'content_view',
  EPISODE_START = 'episode_start',
  EPISODE_COMPLETE = 'episode_complete',
  EPISODE_PROGRESS = 'episode_progress',
  SERIES_DETAILS_VIEW = 'series_details_view',
  
  // Engagement events
  ADD_TO_WATCHLIST = 'add_to_watchlist',
  REMOVE_FROM_WATCHLIST = 'remove_from_watchlist',
  RATE_CONTENT = 'rate_content',
  SHARE_CONTENT = 'share_content',
  
  // Monetization events
  PURCHASE_INITIATED = 'purchase_initiated',
  PURCHASE_COMPLETED = 'purchase_completed',
  PURCHASE_CANCELLED = 'purchase_cancelled',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  COIN_PURCHASE = 'coin_purchase',
  COIN_SPEND = 'coin_spend',
  
  // Ad events
  AD_IMPRESSION = 'ad_impression',
  AD_CLICK = 'ad_click',
  AD_REWARD_EARNED = 'ad_reward_earned',
  
  // Search events
  SEARCH_QUERY = 'search_query',
  SEARCH_RESULTS_VIEW = 'search_results_view',
  
  // Error events
  ERROR = 'error',
  
  // Custom event (for one-off events)
  CUSTOM = 'custom_event'
}

/**
 * Analytics Service Class
 */
class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private anonymousId: string | null = null;
  private sessionStartTime: number = 0;
  private currentScreen: string | null = null;

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    try {
      // In a real implementation, we would initialize 
      // analytics SDKs like Firebase Analytics, Amplitude, etc.
      console.log('Analytics service initialized');
      this.sessionStartTime = Date.now();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing analytics:', error);
      // Continue without analytics rather than breaking the app
    }
  }

  /**
   * Set the user ID for the analytics session
   * @param userId The user's ID (or null for anonymous)
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    // In a real implementation, we would set user ID in analytics SDKs
    console.log(`Analytics user ID set: ${userId || 'anonymous'}`);
  }

  /**
   * Set the anonymous ID for tracking unregistered users
   * @param anonymousId The anonymous ID for the user
   */
  setAnonymousId(anonymousId: string): void {
    this.anonymousId = anonymousId;
    // In a real implementation, we would set anonymous ID in analytics SDKs
    console.log(`Analytics anonymous ID set: ${anonymousId}`);
  }

  /**
   * Track a screen view
   * @param screenName The name of the screen
   * @param params Additional screen parameters
   */
  trackScreen(screenName: string, params: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized when trying to track screen');
      return;
    }

    this.currentScreen = screenName;
    this.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screen_name: screenName,
      ...params
    });
  }

  /**
   * Track an analytics event
   * @param eventType The type of event
   * @param params Event parameters
   */
  trackEvent(eventType: AnalyticsEventType, params: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn(`Analytics not initialized when trying to track event: ${eventType}`);
      return;
    }

    // Create the event payload
    const eventPayload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      session_id: this.sessionStartTime.toString(),
      user_id: this.userId,
      anonymous_id: this.anonymousId,
      current_screen: this.currentScreen,
      ...params
    };

    // In a real implementation, we would send to analytics service
    console.log('Track event:', eventPayload);

    // For a real implementation, add code here to:
    // 1. Send event to analytics backend
    // 2. Queue events if offline and send later
    // 3. Handle batching for performance
  }

  /**
   * Track an error event
   * @param errorCode Error code or type
   * @param errorMessage Human-readable error message
   * @param additionalParams Any additional context for the error
   */
  trackError(errorCode: string, errorMessage: string, additionalParams: Record<string, any> = {}): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      error_code: errorCode,
      error_message: errorMessage,
      ...additionalParams
    });
  }

  /**
   * End the current analytics session
   */
  endSession(): void {
    if (!this.isInitialized) return;

    const sessionDuration = Date.now() - this.sessionStartTime;
    this.trackEvent(AnalyticsEventType.APP_CLOSE, {
      session_duration_ms: sessionDuration
    });

    // In a real implementation, we would flush any queued events
  }
}

// Create and export a singleton instance
export const analyticsService = new AnalyticsService();