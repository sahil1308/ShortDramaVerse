/**
 * Analytics Service
 * 
 * Provides methods for tracking user behavior and app usage.
 * Supports real-time analytics and offline tracking.
 */
import { apiService } from './api';
import { storageService } from './storage';
import { API_CONFIG } from '@/constants/config';

// Types of analytics events
export enum AnalyticsEventType {
  // Content viewing events
  VIEW_SERIES = 'view_series',
  VIEW_EPISODE = 'view_episode',
  COMPLETE_EPISODE = 'complete_episode',
  
  // User interaction events
  ADD_TO_WATCHLIST = 'add_to_watchlist',
  REMOVE_FROM_WATCHLIST = 'remove_from_watchlist',
  RATE_SERIES = 'rate_series',
  SHARE_CONTENT = 'share_content',
  
  // Search events
  SEARCH = 'search',
  FILTER = 'filter',
  
  // Purchase events
  VIEW_SUBSCRIPTION = 'view_subscription',
  PURCHASE_SUBSCRIPTION = 'purchase_subscription',
  PURCHASE_COINS = 'purchase_coins',
  SPEND_COINS = 'spend_coins',
  
  // App usage events
  APP_OPEN = 'app_open',
  APP_BACKGROUND = 'app_background',
  SCREEN_VIEW = 'screen_view',
  ERROR = 'error',
  
  // Performance events
  LOAD_TIME = 'load_time',
  BUFFER_TIME = 'buffer_time',
  
  // Custom event
  CUSTOM = 'custom'
}

// Interface for analytics events
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  properties: Record<string, any>;
  userId?: number | string; // Optional as user may not be logged in
}

// Cached events for offline tracking
interface CachedEvents {
  events: AnalyticsEvent[];
  lastSyncTime: number;
}

/**
 * Analytics Service Class
 * 
 * Handles tracking and reporting of user behavior and app usage
 */
class AnalyticsService {
  private initialized: boolean = false;
  private userId: string | number | null = null;
  private queuedEvents: AnalyticsEvent[] = [];
  private isSyncing: boolean = false;
  private syncInterval: any = null; // For automatic syncing
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Get user ID if logged in
      const user = await storageService.getUser();
      if (user && user.id) {
        this.userId = user.id;
      }
      
      // Load cached events
      const cached = await this.loadCachedEvents();
      if (cached && cached.events.length > 0) {
        this.queuedEvents = [...cached.events];
        // Try to sync immediately if there are cached events
        this.syncEvents();
      }
      
      // Set up automatic syncing
      this.setupAutoSync();
      
      this.initialized = true;
      
      // Track app open event
      this.trackEvent(AnalyticsEventType.APP_OPEN);
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }
  
  /**
   * Set up automatic syncing of analytics events
   */
  private setupAutoSync(intervalMs: number = 60000): void {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Set up new interval for syncing
    this.syncInterval = setInterval(() => {
      if (this.queuedEvents.length > 0) {
        this.syncEvents();
      }
    }, intervalMs);
  }
  
  /**
   * Track an analytics event
   * 
   * @param eventType Type of event to track
   * @param properties Additional properties for the event
   */
  async trackEvent(
    eventType: AnalyticsEventType,
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Create event object
      const event: AnalyticsEvent = {
        eventType,
        timestamp: Date.now(),
        properties,
        userId: this.userId || undefined
      };
      
      // Add to queue
      this.queuedEvents.push(event);
      
      // Save to cache
      await this.saveEventsToCache();
      
      // If we have enough events or it's a high-priority event, sync immediately
      if (this.queuedEvents.length >= 10 || this.isHighPriorityEvent(eventType)) {
        this.syncEvents();
      }
    } catch (error) {
      console.error(`Failed to track event ${eventType}:`, error);
    }
  }
  
  /**
   * Determine if an event is high priority and should be synced immediately
   */
  private isHighPriorityEvent(eventType: AnalyticsEventType): boolean {
    // Events that should be synced immediately
    const highPriorityEvents = [
      AnalyticsEventType.PURCHASE_SUBSCRIPTION,
      AnalyticsEventType.PURCHASE_COINS,
      AnalyticsEventType.SPEND_COINS,
      AnalyticsEventType.ERROR,
      AnalyticsEventType.COMPLETE_EPISODE
    ];
    
    return highPriorityEvents.includes(eventType);
  }
  
  /**
   * Save events to cache for offline tracking
   */
  private async saveEventsToCache(): Promise<void> {
    try {
      const cachedData: CachedEvents = {
        events: this.queuedEvents,
        lastSyncTime: Date.now()
      };
      
      await storageService.set('analytics_cache', cachedData);
    } catch (error) {
      console.error('Failed to save events to cache:', error);
    }
  }
  
  /**
   * Load cached events from storage
   */
  private async loadCachedEvents(): Promise<CachedEvents | null> {
    try {
      return await storageService.get<CachedEvents>('analytics_cache');
    } catch (error) {
      console.error('Failed to load cached events:', error);
      return null;
    }
  }
  
  /**
   * Sync events with the analytics server
   */
  async syncEvents(): Promise<void> {
    // Prevent multiple syncs at once
    if (this.isSyncing || this.queuedEvents.length === 0) return;
    
    this.isSyncing = true;
    
    try {
      // Copy current events
      const eventsToSync = [...this.queuedEvents];
      
      // Send to server
      await apiService.post(API_CONFIG.ENDPOINTS.ANALYTICS.USER, {
        events: eventsToSync
      });
      
      // Remove synced events from queue
      this.queuedEvents = this.queuedEvents.filter(
        event => !eventsToSync.includes(event)
      );
      
      // Update cache
      await this.saveEventsToCache();
      
      console.log(`Synced ${eventsToSync.length} analytics events`);
    } catch (error) {
      console.error('Failed to sync analytics events:', error);
      // Keep events in queue for retry
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Update user ID when user logs in or out
   */
  updateUserId(userId: string | number | null): void {
    this.userId = userId;
    
    // Track login/logout event when ID changes
    if (userId) {
      this.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'user_login',
        userId
      });
    } else {
      this.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'user_logout'
      });
    }
  }
  
  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties: Record<string, any> = {}): void {
    this.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screenName,
      ...properties
    });
  }
  
  /**
   * Track content viewing
   */
  trackContentView(
    contentType: 'series' | 'episode',
    contentId: string | number,
    contentName: string,
    properties: Record<string, any> = {}
  ): void {
    const eventType = contentType === 'series' 
      ? AnalyticsEventType.VIEW_SERIES 
      : AnalyticsEventType.VIEW_EPISODE;
    
    this.trackEvent(eventType, {
      contentId,
      contentName,
      ...properties
    });
  }
  
  /**
   * Track content completion (episode watched)
   */
  trackContentComplete(
    episodeId: string | number,
    episodeName: string,
    seriesId: string | number,
    progress: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.COMPLETE_EPISODE, {
      episodeId,
      episodeName,
      seriesId,
      progress,
      ...properties
    });
  }
  
  /**
   * Track search action
   */
  trackSearch(
    searchTerm: string,
    resultsCount: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.SEARCH, {
      searchTerm,
      resultsCount,
      ...properties
    });
  }
  
  /**
   * Track error
   */
  trackError(
    errorMessage: string,
    errorCode?: string | number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      errorMessage,
      errorCode,
      ...properties
    });
  }
  
  /**
   * Get user analytics data
   * Returns viewing habits, preferences, and trends for the current user
   */
  async getUserAnalytics(): Promise<any> {
    try {
      return await apiService.get(API_CONFIG.ENDPOINTS.ANALYTICS.USER);
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get content analytics data
   * Returns performance metrics for a specific piece of content
   */
  async getContentAnalytics(contentId: string | number, contentType: 'series' | 'episode'): Promise<any> {
    try {
      return await apiService.get(`${API_CONFIG.ENDPOINTS.ANALYTICS.CONTENT}`, {
        contentId,
        contentType
      });
    } catch (error) {
      console.error('Failed to get content analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get admin analytics dashboard data
   * Returns comprehensive analytics for administrators
   */
  async getAdminAnalytics(): Promise<any> {
    try {
      return await apiService.get(API_CONFIG.ENDPOINTS.ANALYTICS.ADMIN);
    } catch (error) {
      console.error('Failed to get admin analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get trending content analytics
   * Returns trending series and episodes based on views, ratings, etc.
   */
  async getTrends(
    timeframe: 'day' | 'week' | 'month' = 'week',
    limit: number = 10
  ): Promise<any> {
    try {
      return await apiService.get(API_CONFIG.ENDPOINTS.ANALYTICS.TRENDS, {
        timeframe,
        limit
      });
    } catch (error) {
      console.error('Failed to get trends:', error);
      throw error;
    }
  }
  
  /**
   * Clean up resources when app is closing
   */
  async cleanUp(): Promise<void> {
    // Track app background event
    await this.trackEvent(AnalyticsEventType.APP_BACKGROUND);
    
    // Sync any remaining events
    await this.syncEvents();
    
    // Clear sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const analyticsService = new AnalyticsService();