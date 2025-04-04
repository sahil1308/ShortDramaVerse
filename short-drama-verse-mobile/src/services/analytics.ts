/**
 * Analytics Service
 * 
 * Tracks user behavior and app usage for analytics purposes.
 * Handles batching of analytics events and offline caching.
 */
import { apiService } from './api';
import { storageService } from './storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { AppState, Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import DeviceInfo from 'react-native-device-info';

// Analytics event types
export enum AnalyticsEventType {
  APP_OPEN = 'app_open',
  APP_CLOSE = 'app_close',
  SCREEN_VIEW = 'screen_view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTRATION = 'registration',
  SERIES_VIEW = 'series_view',
  EPISODE_START = 'episode_start',
  EPISODE_PROGRESS = 'episode_progress',
  EPISODE_COMPLETE = 'episode_complete',
  EPISODE_LIKE = 'episode_like',
  EPISODE_DISLIKE = 'episode_dislike',
  EPISODE_SHARE = 'episode_share',
  EPISODE_COMMENT = 'episode_comment',
  EPISODE_DOWNLOAD = 'episode_download',
  SEARCH = 'search',
  WATCHLIST_ADD = 'watchlist_add',
  WATCHLIST_REMOVE = 'watchlist_remove',
  SUBSCRIPTION_VIEW = 'subscription_view',
  SUBSCRIPTION_PURCHASE = 'subscription_purchase',
  ERROR = 'error',
}

// Interface for analytics events
interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  userId?: string | null;
  deviceId: string;
  sessionId: string;
  properties: Record<string, any>;
  platform: string;
  appVersion: string;
  osVersion: string;
}

/**
 * Analytics Service
 * 
 * Provides methods for tracking user behavior and app usage.
 */
class AnalyticsService {
  private _deviceId: string | null = null;
  private _sessionId: string | null = null;
  private _userId: string | null = null;
  private _eventQueue: AnalyticsEvent[] = [];
  private _isSending: boolean = false;
  private _batchTimeoutId: NodeJS.Timeout | null = null;
  private _initialized: boolean = false;
  private _appVersion: string = '';
  private _osVersion: string = '';
  private _sessionStartTime: number = 0;
  private _appState: 'active' | 'background' | 'inactive' = 'active';

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    // Avoid multiple initializations
    if (this._initialized) return;

    try {
      // Get or generate device ID
      this._deviceId = await this.getDeviceId();
      
      // Start a new session
      this._sessionId = this.generateSessionId();
      this._sessionStartTime = Date.now();
      
      // Get user ID from storage if logged in
      const user = await storageService.getUser();
      this._userId = user?.id?.toString() || null;
      
      // Get device info
      this._appVersion = await DeviceInfo.getVersion();
      this._osVersion = await DeviceInfo.getSystemVersion();
      
      // Load cached events from storage
      await this.loadCachedEvents();
      
      // Start monitoring app state
      this.setupAppStateListener();
      
      // Start batch sending
      this.startBatching();
      
      // Track app open event
      this.trackEvent(AnalyticsEventType.APP_OPEN, {});
      
      this._initialized = true;
      
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Error initializing analytics service:', error);
    }
  }

  /**
   * Get device ID or generate if not exists
   */
  private async getDeviceId(): Promise<string> {
    const storedDeviceId = await storageService.getDeviceId();
    
    if (storedDeviceId) {
      return storedDeviceId;
    }
    
    // Generate new device ID
    const newDeviceId = uuidv4();
    await storageService.setDeviceId(newDeviceId);
    return newDeviceId;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return uuidv4();
  }

  /**
   * Set up listener for app state changes
   */
  private setupAppStateListener(): void {
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange(nextAppState: string): void {
    // Track app close/background event
    if (
      this._appState === 'active' && 
      (nextAppState === 'background' || nextAppState === 'inactive')
    ) {
      this.trackEvent(AnalyticsEventType.APP_CLOSE, {
        sessionDuration: Date.now() - this._sessionStartTime,
      });
      
      // Force send events when going to background
      this.sendBatch(true);
    }
    
    // Track app open/resume event
    if (
      (this._appState === 'background' || this._appState === 'inactive') && 
      nextAppState === 'active'
    ) {
      // If session has timed out, create a new session
      if (Date.now() - this._sessionStartTime > APP_CONFIG.SESSION_TIMEOUT) {
        this._sessionId = this.generateSessionId();
        this._sessionStartTime = Date.now();
      }
      
      this.trackEvent(AnalyticsEventType.APP_OPEN, {
        isResume: true,
      });
    }
    
    // Update current state
    this._appState = nextAppState as 'active' | 'background' | 'inactive';
  }

  /**
   * Start batching of analytics events
   */
  private startBatching(): void {
    if (this._batchTimeoutId) {
      clearTimeout(this._batchTimeoutId);
    }
    
    this._batchTimeoutId = setTimeout(() => {
      this.sendBatch();
      this.startBatching();
    }, APP_CONFIG.ANALYTICS_BATCH_INTERVAL);
  }

  /**
   * Load cached events from storage
   */
  private async loadCachedEvents(): Promise<void> {
    try {
      const cachedEvents = await storageService.getPreference<AnalyticsEvent[]>(
        STORAGE_KEYS.ANALYTICS_CACHE, 
        []
      );
      
      if (cachedEvents && cachedEvents.length > 0) {
        this._eventQueue = [...cachedEvents, ...this._eventQueue];
        console.log(`Loaded ${cachedEvents.length} cached analytics events`);
      }
    } catch (error) {
      console.error('Error loading cached analytics events:', error);
    }
  }

  /**
   * Save events to cache
   */
  private async saveEventCache(): Promise<void> {
    try {
      await storageService.setPreference(
        STORAGE_KEYS.ANALYTICS_CACHE, 
        this._eventQueue
      );
    } catch (error) {
      console.error('Error saving analytics events cache:', error);
    }
  }

  /**
   * Set the user ID for analytics
   */
  setUserId(userId: string | null): void {
    this._userId = userId;
  }

  /**
   * Track an analytics event
   * 
   * @param eventType The type of event to track
   * @param properties Additional properties for the event
   */
  trackEvent(eventType: AnalyticsEventType, properties: Record<string, any>): void {
    if (!this._deviceId || !this._sessionId) {
      // Queue the event for when we're initialized
      setTimeout(() => this.trackEvent(eventType, properties), 1000);
      return;
    }
    
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      userId: this._userId,
      deviceId: this._deviceId!,
      sessionId: this._sessionId!,
      properties,
      platform: Platform.OS,
      appVersion: this._appVersion,
      osVersion: this._osVersion,
    };
    
    this._eventQueue.push(event);
    
    // If we've reached the batch size, send immediately
    if (this._eventQueue.length >= APP_CONFIG.ANALYTICS_BATCH_SIZE) {
      this.sendBatch();
    } else {
      // Otherwise, save to cache
      this.saveEventCache();
    }
  }

  /**
   * Send batched events to the server
   * 
   * @param force Force sending even if already sending
   */
  private async sendBatch(force: boolean = false): Promise<void> {
    // If already sending or no events, skip
    if ((this._isSending && !force) || this._eventQueue.length === 0) {
      return;
    }
    
    this._isSending = true;
    
    try {
      // Get current batch and clear from queue
      const batch = [...this._eventQueue];
      this._eventQueue = [];
      
      // Clear the cache
      await storageService.setPreference(STORAGE_KEYS.ANALYTICS_CACHE, []);
      
      // Send to server
      await apiService.post(API_CONFIG.ENDPOINTS.ANALYTICS.TRACK_ENGAGEMENT, {
        events: batch,
      });
      
      console.log(`Successfully sent ${batch.length} analytics events`);
    } catch (error) {
      console.error('Error sending analytics batch:', error);
      
      // Put events back in queue
      this._eventQueue = [...this._eventQueue, ...this._eventQueue];
      
      // Save failed events to cache
      await this.saveEventCache();
    } finally {
      this._isSending = false;
    }
  }

  /**
   * Track screen view
   * 
   * @param screenName Name of the screen
   * @param params Optional parameters for the screen
   */
  trackScreenView(screenName: string, params?: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screenName,
      params,
    });
  }

  /**
   * Track login attempt
   * 
   * @param success Whether the login was successful
   * @param method The login method used
   * @param error Error message if login failed
   */
  trackLoginAttempt(success: boolean, method: string = 'email', error?: string): void {
    this.trackEvent(AnalyticsEventType.LOGIN, {
      success,
      method,
      error,
    });
  }

  /**
   * Track registration attempt
   * 
   * @param success Whether the registration was successful
   * @param method The registration method used
   * @param error Error message if registration failed
   */
  trackRegistrationAttempt(success: boolean, method: string = 'email', error?: string): void {
    this.trackEvent(AnalyticsEventType.REGISTRATION, {
      success,
      method,
      error,
    });
  }

  /**
   * Track series view
   * 
   * @param seriesId ID of the series
   * @param seriesName Name of the series
   * @param source Where the series was accessed from
   */
  trackSeriesView(seriesId: number | string, seriesName: string, source?: string): void {
    this.trackEvent(AnalyticsEventType.SERIES_VIEW, {
      seriesId,
      seriesName,
      source,
    });
  }

  /**
   * Track episode start
   * 
   * @param episodeId ID of the episode
   * @param episodeName Name of the episode
   * @param seriesId ID of the series
   * @param seriesName Name of the series
   * @param episodeNumber Episode number
   * @param seasonNumber Season number
   * @param source Where the episode was accessed from
   */
  trackEpisodeStart(
    episodeId: number | string,
    episodeName: string,
    seriesId: number | string,
    seriesName: string,
    episodeNumber: number,
    seasonNumber: number = 1,
    source?: string
  ): void {
    this.trackEvent(AnalyticsEventType.EPISODE_START, {
      episodeId,
      episodeName,
      seriesId,
      seriesName,
      episodeNumber,
      seasonNumber,
      source,
    });
  }

  /**
   * Track episode progress
   * 
   * @param episodeId ID of the episode
   * @param progress Progress percentage (0-100)
   * @param currentTime Current playback time in seconds
   * @param totalTime Total duration in seconds
   */
  trackEpisodeProgress(
    episodeId: number | string,
    progress: number,
    currentTime: number,
    totalTime: number
  ): void {
    // Only track progress at certain intervals to avoid too many events
    if (progress % 10 !== 0 && progress !== APP_CONFIG.COMPLETION_THRESHOLD) {
      return;
    }
    
    this.trackEvent(AnalyticsEventType.EPISODE_PROGRESS, {
      episodeId,
      progress,
      currentTime,
      totalTime,
    });
    
    // If progress is past the completion threshold, also track as completed
    if (progress >= APP_CONFIG.COMPLETION_THRESHOLD) {
      this.trackEpisodeComplete(episodeId, currentTime, totalTime);
    }
  }

  /**
   * Track episode completion
   * 
   * @param episodeId ID of the episode
   * @param duration Duration watched in seconds
   * @param totalDuration Total duration in seconds
   */
  trackEpisodeComplete(
    episodeId: number | string,
    duration: number,
    totalDuration: number
  ): void {
    this.trackEvent(AnalyticsEventType.EPISODE_COMPLETE, {
      episodeId,
      duration,
      totalDuration,
      completionRatio: duration / totalDuration,
    });
  }

  /**
   * Track search
   * 
   * @param query Search query
   * @param resultsCount Number of results
   * @param filters Any filters applied
   */
  trackSearch(query: string, resultsCount: number, filters?: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.SEARCH, {
      query,
      resultsCount,
      filters,
    });
  }

  /**
   * Track error
   * 
   * @param errorType Type of error
   * @param errorMessage Error message
   * @param errorCode Error code if available
   * @param context Additional context about where the error occurred
   */
  trackError(
    errorType: string,
    errorMessage: string,
    errorCode?: string | number,
    context?: Record<string, any>
  ): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      errorType,
      errorMessage,
      errorCode,
      context,
    });
  }
}

export const analyticsService = new AnalyticsService();