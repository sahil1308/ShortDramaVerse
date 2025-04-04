/**
 * Analytics Service for ShortDramaVerse Mobile
 * 
 * This service tracks user interactions and analytics data
 * for reporting and insight generation.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { StorageKey } from './storage';
import api from './api';

// Number of events to store before automatic sending
const EVENT_BATCH_SIZE = 20;

// Analytics event types enum
export enum AnalyticsEventType {
  // App lifecycle events
  APP_OPEN = 'app_open',
  APP_CLOSE = 'app_close',
  
  // Screen view events
  SCREEN_VIEW = 'screen_view',
  
  // Video player events
  VIDEO_PLAY = 'video_play',
  VIDEO_PAUSE = 'video_pause',
  VIDEO_SEEK = 'video_seek',
  VIDEO_COMPLETE = 'video_complete',
  VIDEO_PROGRESS = 'video_progress',
  
  // User interaction events
  BUTTON_CLICK = 'button_click',
  TAB_CHANGE = 'tab_change',
  LIST_ITEM_CLICK = 'list_item_click',
  
  // Search events
  SEARCH = 'search',
  FILTER_CHANGE = 'filter_change',
  
  // User action events
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTRATION = 'registration',
  
  // Content events
  ADD_TO_WATCHLIST = 'add_to_watchlist',
  REMOVE_FROM_WATCHLIST = 'remove_from_watchlist',
  SHARE_CONTENT = 'share_content',
  RATE_CONTENT = 'rate_content',
  COMMENT = 'comment',
  DOWNLOAD_START = 'download_start',
  DOWNLOAD_COMPLETE = 'download_complete',
  DOWNLOAD_ERROR = 'download_error',
  
  // Purchase events
  PURCHASE_INITIATED = 'purchase_initiated',
  PURCHASE_COMPLETED = 'purchase_completed',
  PURCHASE_FAILED = 'purchase_failed',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  
  // Error events
  ERROR = 'error',
}

// Analytics event interface
interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  userId?: number;
  sessionId: string;
  data: Record<string, any>;
  deviceInfo: DeviceInfo;
}

// Device information interface
interface DeviceInfo {
  deviceId: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  screenWidth: number;
  screenHeight: number;
  networkType?: string;
  language: string;
  timezone: string;
}

/**
 * Analytics Service class for tracking user interactions
 * and app usage for analytics and reporting
 */
class AnalyticsService {
  private userId: number | null = null;
  private sessionId: string;
  private deviceInfo: DeviceInfo;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized: boolean = false;
  private isOffline: boolean = false;
  private isSending: boolean = false;
  
  constructor() {
    // Generate unique session ID
    this.sessionId = this.generateSessionId();
    
    // Get device info
    const { width, height } = Dimensions.get('window');
    
    this.deviceInfo = {
      deviceId: 'unknown', // Will be set during initialization
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: process.env.APP_VERSION || '1.0.0',
      deviceModel: Platform.OS === 'ios' ? 'iPhone' : 'Android', // Simplified
      screenWidth: width,
      screenHeight: height,
      language: 'en', // Default, will be updated later
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  
  /**
   * Initialize analytics service
   */
  public async initialize(): Promise<void> {
    try {
      // Check if device ID exists in storage
      let deviceId = await AsyncStorage.getItem(StorageKey.DEVICE_ID);
      
      if (!deviceId) {
        // Generate new device ID
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem(StorageKey.DEVICE_ID, deviceId);
      }
      
      // Update device info
      this.deviceInfo.deviceId = deviceId;
      
      // Load saved unsent events
      const savedEvents = await AsyncStorage.getItem(StorageKey.ANALYTICS_EVENTS);
      if (savedEvents) {
        try {
          this.eventQueue = JSON.parse(savedEvents);
        } catch (error) {
          console.error('Error parsing saved analytics events:', error);
          this.eventQueue = [];
        }
      }
      
      // Mark as initialized
      this.isInitialized = true;
      
      // Send any queued events
      this.flushEvents();
      
      console.log('Analytics service initialized');
      
    } catch (error) {
      console.error('Error initializing analytics service:', error);
    }
  }
  
  /**
   * Set user ID for analytics
   * 
   * @param userId - User ID to set
   */
  public setUserId(userId: number | null): void {
    this.userId = userId;
  }
  
  /**
   * Set network status
   * 
   * @param isOffline - Whether device is offline
   */
  public setOfflineStatus(isOffline: boolean): void {
    this.isOffline = isOffline;
  }
  
  /**
   * Track generic event
   * 
   * @param eventType - Type of event to track
   * @param data - Additional event data
   */
  public trackEvent(eventType: AnalyticsEventType, data: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics service not initialized');
      return;
    }
    
    // Create event
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      data,
      deviceInfo: this.deviceInfo,
    };
    
    // Add to queue
    this.eventQueue.push(event);
    
    // Save queue to storage
    this.saveEventQueue();
    
    // Send if batch size reached
    if (this.eventQueue.length >= EVENT_BATCH_SIZE && !this.isOffline) {
      this.flushEvents();
    }
  }
  
  /**
   * Track screen view
   * 
   * @param screenName - Name of screen being viewed
   * @param screenClass - Class of screen component
   */
  public trackScreenView(screenName: string, screenClass?: string): void {
    this.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screenName,
      screenClass,
    });
  }
  
  /**
   * Track video event
   * 
   * @param eventType - Type of video event
   * @param data - Video event data
   */
  public trackVideoEvent(
    eventType: AnalyticsEventType,
    data: {
      episodeId: number;
      seriesId: number;
      position?: number;
      duration?: number;
    }
  ): void {
    this.trackEvent(eventType, data);
  }
  
  /**
   * Track search event
   * 
   * @param query - Search query
   * @param resultsCount - Number of results
   * @param filters - Search filters applied
   */
  public trackSearch(
    query: string,
    resultsCount: number,
    filters?: Record<string, any>
  ): void {
    this.trackEvent(AnalyticsEventType.SEARCH, {
      query,
      resultsCount,
      filters,
    });
  }
  
  /**
   * Track content rating
   * 
   * @param seriesId - ID of series being rated
   * @param score - Rating score (1-5)
   * @param hasComment - Whether rating includes comment
   */
  public trackContentRating(
    seriesId: number,
    score: number,
    hasComment: boolean
  ): void {
    this.trackEvent(AnalyticsEventType.RATE_CONTENT, {
      seriesId,
      score,
      hasComment,
    });
  }
  
  /**
   * Track error
   * 
   * @param errorName - Error name
   * @param errorMessage - Error message
   * @param stack - Error stack trace
   */
  public trackError(
    errorName: string,
    errorMessage: string,
    stack?: string
  ): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      errorName,
      errorMessage,
      stack,
    });
  }
  
  /**
   * Send all queued events to server
   */
  public async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || this.isOffline || this.isSending) {
      return;
    }
    
    try {
      this.isSending = true;
      
      // Send events to server
      await api.post('/analytics/events', {
        events: this.eventQueue,
      });
      
      // Clear queue
      this.eventQueue = [];
      
      // Save empty queue
      this.saveEventQueue();
      
    } catch (error) {
      console.error('Error sending analytics events:', error);
    } finally {
      this.isSending = false;
    }
  }
  
  /**
   * Save event queue to storage
   */
  private async saveEventQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageKey.ANALYTICS_EVENTS,
        JSON.stringify(this.eventQueue)
      );
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }
  
  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    return 'dv_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + 
           Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Send any queued events before cleanup
    this.flushEvents();
  }
}

// Export as singleton
export default new AnalyticsService();