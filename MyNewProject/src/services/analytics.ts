/**
 * Analytics Service
 * 
 * Tracks user actions and events for analytics purposes.
 * Integrates with anonymous user identification.
 */
import { deviceIdentifierService } from './deviceIdentifier';
import { storageService } from './storage';

/**
 * Types of events that can be tracked
 */
export enum AnalyticsEventType {
  SCREEN_VIEW = 'screen_view',
  CONTENT_VIEW = 'content_view',
  CONTENT_COMPLETE = 'content_complete',
  CONTENT_BOOKMARK = 'content_bookmark',
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  RECOMMENDATION_IMPRESSION = 'recommendation_impression',
  RECOMMENDATION_CLICK = 'recommendation_click',
  PREFERENCE_UPDATE = 'preference_update',
  IN_APP_PURCHASE = 'in_app_purchase',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SEARCH_QUERY = 'search_query',
  NETWORK_ERROR = 'network_error',
  APP_FOREGROUND = 'app_foreground',
  APP_BACKGROUND = 'app_background',
  AD_IMPRESSION = 'ad_impression',
  AD_CLICK = 'ad_click',
  AD_COMPLETE = 'ad_complete',
  SHARE = 'share',
  APP_RATING = 'app_rating',
  APP_UPDATE = 'app_update',
  CUSTOM = 'custom'
}

/**
 * Base properties for all analytics events
 */
interface AnalyticsBaseProperties {
  userId?: string;
  anonymousId: string;
  deviceId: string;
  timestamp: string;
  sessionId: string;
  appVersion: string;
  platform: 'android' | 'ios' | 'web';
  osVersion: string;
  deviceModel: string;
  language: string;
}

/**
 * Analytics event data structure
 */
interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  properties: Record<string, any>;
  baseProperties: AnalyticsBaseProperties;
}

class AnalyticsService {
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private initialized = false;
  private flushInterval: any;
  private sessionStartTime: number;
  
  constructor() {
    // Generate a new session ID
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    // Initialize the service
    this.initialize();
  }
  
  /**
   * Initialize analytics service
   */
  private async initialize() {
    if (this.initialized) return;
    
    try {
      // Set up flush interval to send batched events
      this.flushInterval = setInterval(() => this.flushEvents(), 30000);
      
      // Load any pending events from storage
      const pendingEvents = await this.loadPendingEvents();
      if (pendingEvents && pendingEvents.length > 0) {
        this.eventQueue.push(...pendingEvents);
        this.flushEvents();
      }
      
      this.initialized = true;
      
      // Track app foreground event
      this.trackEvent(AnalyticsEventType.APP_FOREGROUND, {
        sessionStartTime: this.sessionStartTime
      });
      
      // Set up app background tracking
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            this.trackEvent(AnalyticsEventType.APP_BACKGROUND, {
              sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
            });
            this.flushEvents(true);
          } else if (document.visibilityState === 'visible') {
            this.sessionId = this.generateSessionId();
            this.sessionStartTime = Date.now();
            this.trackEvent(AnalyticsEventType.APP_FOREGROUND, {
              sessionStartTime: this.sessionStartTime
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Load pending events from storage
   */
  private async loadPendingEvents(): Promise<AnalyticsEvent[]> {
    try {
      return await storageService.getJsonItem<AnalyticsEvent[]>('pending_analytics_events') || [];
    } catch (error) {
      console.error('Failed to load pending analytics events:', error);
      return [];
    }
  }
  
  /**
   * Save pending events to storage
   */
  private async savePendingEvents(): Promise<void> {
    try {
      await storageService.setJsonItem('pending_analytics_events', this.eventQueue);
    } catch (error) {
      console.error('Failed to save pending analytics events:', error);
    }
  }
  
  /**
   * Get base properties for all events
   */
  private async getBaseProperties(): Promise<AnalyticsBaseProperties> {
    // Get device information
    const deviceInfo = await deviceIdentifierService.getDeviceInfo();
    
    // Get anonymous user ID
    const anonymousId = await deviceIdentifierService.getAnonymousId();
    
    return {
      anonymousId,
      deviceId: deviceInfo.uniqueId,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      appVersion: deviceInfo.appVersion || '1.0.0',
      platform: deviceInfo.platform as 'android' | 'ios' | 'web',
      osVersion: deviceInfo.osVersion || '',
      deviceModel: deviceInfo.model || '',
      language: deviceInfo.language || 'en'
    };
  }
  
  /**
   * Track an analytics event
   */
  public async trackEvent(
    eventType: AnalyticsEventType,
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      const baseProperties = await this.getBaseProperties();
      
      // Create event object
      const event: AnalyticsEvent = {
        eventType,
        properties,
        baseProperties
      };
      
      // Add to queue
      this.eventQueue.push(event);
      
      // If queue is getting large, flush immediately
      if (this.eventQueue.length >= 20) {
        this.flushEvents();
      } else {
        // Otherwise save to storage in case app closes before flush
        this.savePendingEvents();
      }
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', eventType, properties);
      }
    } catch (error) {
      console.error(`Failed to track event ${eventType}:`, error);
    }
  }
  
  /**
   * Flush events to backend
   */
  private async flushEvents(immediate = false): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    try {
      // Make a copy of the current queue
      const eventsToSend = [...this.eventQueue];
      
      // Clear the queue
      this.eventQueue = [];
      
      // Clear pending events from storage
      await storageService.removeItem('pending_analytics_events');
      
      // TODO: Send events to analytics backend
      // This would typically be an API call to your analytics service
      
      // For now, we're just logging to console
      console.log(`[Analytics] Flushed ${eventsToSend.length} events`);
      
      // If in a real environment, you would send this data to your analytics backend:
      // await apiService.post('/analytics/events', { events: eventsToSend });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      
      // Put events back in the queue if sending failed
      this.eventQueue.push(...this.eventQueue);
      this.savePendingEvents();
    }
  }
  
  /**
   * Track screen view
   */
  public trackScreen(screenName: string, properties: Record<string, any> = {}): void {
    this.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties
    });
  }
  
  /**
   * Track content view
   */
  public trackContentView(
    contentId: number,
    contentType: 'series' | 'episode',
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.CONTENT_VIEW, {
      content_id: contentId,
      content_type: contentType,
      ...properties
    });
  }
  
  /**
   * Track recommendation impression
   */
  public trackRecommendationImpression(
    recommendations: any[],
    source: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.RECOMMENDATION_IMPRESSION, {
      recommendations,
      source,
      ...properties
    });
  }
  
  /**
   * Track recommendation click
   */
  public trackRecommendationClick(
    contentId: number,
    contentType: 'series' | 'episode',
    source: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.RECOMMENDATION_CLICK, {
      content_id: contentId,
      content_type: contentType,
      source,
      ...properties
    });
  }
  
  /**
   * Track search query
   */
  public trackSearch(
    query: string,
    resultCount: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.SEARCH_QUERY, {
      query,
      result_count: resultCount,
      ...properties
    });
  }
  
  /**
   * Track error
   */
  public trackError(
    errorType: string,
    errorMessage: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
      error_type: errorType,
      error_message: errorMessage,
      ...properties
    });
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush any remaining events
    this.flushEvents(true);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();