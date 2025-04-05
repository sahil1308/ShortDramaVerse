/**
 * Anonymous Authentication Service
 * 
 * Handles creating and maintaining anonymous user identities
 * without requiring explicit registration or login.
 */
import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storage';
import { apiService } from './api';
import { analyticsService } from './analytics';
import { AnalyticsEventType } from './analytics';

// Key for storing anonymous user ID
const ANONYMOUS_USER_ID_KEY = 'anonymous_user_id';
const DEVICE_INFO_KEY = 'device_info';

/**
 * Anonymous User information interface
 */
export interface AnonymousUserInfo {
  id: string;
  createdAt: string;
  lastSeen: string;
  deviceInfo?: {
    platform?: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

/**
 * Anonymous Authentication Service Class
 */
class AnonymousAuthService {
  private currentUser: AnonymousUserInfo | null = null;
  private isInitialized = false;

  /**
   * Initialize the anonymous auth service
   * Generate or retrieve anonymous user ID
   */
  async initialize(): Promise<AnonymousUserInfo> {
    try {
      if (this.isInitialized && this.currentUser) {
        return this.currentUser;
      }

      // Try to get existing user ID from storage
      let userId = await storageService.getItem(ANONYMOUS_USER_ID_KEY);
      let deviceInfo = await storageService.getItem(DEVICE_INFO_KEY);
      let isNewUser = false;

      // If no existing ID, generate a new one
      if (!userId) {
        userId = uuidv4();
        isNewUser = true;
        await storageService.setItem(ANONYMOUS_USER_ID_KEY, userId);
      }

      // Collect basic device info for better user tracking
      if (!deviceInfo) {
        // In a real implementation, we would get actual device info
        deviceInfo = {
          platform: 'android', // or 'ios'
          deviceModel: 'Unknown',
          osVersion: 'Unknown',
          appVersion: '1.0.0'
        };
        await storageService.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
      } else if (typeof deviceInfo === 'string') {
        deviceInfo = JSON.parse(deviceInfo);
      }

      // Current timestamp for tracking
      const now = new Date().toISOString();

      // Create user info object
      this.currentUser = {
        id: userId,
        createdAt: isNewUser ? now : now, // Would be retrieved from server in real implementation
        lastSeen: now,
        deviceInfo
      };

      // Register or update the anonymous user on the server
      await this.registerAnonymousUser(isNewUser);

      this.isInitialized = true;
      return this.currentUser;
    } catch (error) {
      console.error('Error initializing anonymous auth:', error);
      // Fallback to a new random ID if there was an error
      const fallbackId = uuidv4();
      const now = new Date().toISOString();
      this.currentUser = {
        id: fallbackId,
        createdAt: now,
        lastSeen: now
      };
      await storageService.setItem(ANONYMOUS_USER_ID_KEY, fallbackId);
      this.isInitialized = true;
      return this.currentUser;
    }
  }

  /**
   * Get the current anonymous user
   * Will initialize if not already done
   */
  async getCurrentUser(): Promise<AnonymousUserInfo> {
    if (!this.isInitialized || !this.currentUser) {
      return this.initialize();
    }
    return this.currentUser;
  }

  /**
   * Update the last seen timestamp for the current user
   */
  async updateLastSeen(): Promise<void> {
    if (!this.currentUser) {
      await this.initialize();
    }

    if (this.currentUser) {
      this.currentUser.lastSeen = new Date().toISOString();
      try {
        // Update last seen on server
        await apiService.post('/api/anonymous/update-last-seen', {
          anonymousId: this.currentUser.id
        });
      } catch (error) {
        console.error('Error updating last seen:', error);
        // Continue even if server update fails
      }
    }
  }

  /**
   * Convert anonymous user to a registered user
   * Transfers viewing history, preferences, etc.
   * 
   * @param userId The new registered user ID
   * @returns Promise resolving to success status
   */
  async convertToRegisteredUser(userId: number): Promise<boolean> {
    try {
      if (!this.currentUser) {
        await this.initialize();
      }

      if (!this.currentUser) {
        return false;
      }

      // Call API to merge anonymous user with registered user
      await apiService.post('/api/auth/convert-anonymous', {
        anonymousId: this.currentUser.id,
        registeredUserId: userId
      });

      // Track conversion in analytics
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'anonymous_user_converted',
        anonymousId: this.currentUser.id,
        registeredUserId: userId
      });

      // Clear the anonymous ID from storage
      await storageService.removeItem(ANONYMOUS_USER_ID_KEY);

      this.currentUser = null;
      this.isInitialized = false;

      return true;
    } catch (error) {
      console.error('Error converting anonymous user:', error);
      return false;
    }
  }

  /**
   * Register the anonymous user with the backend
   * @param isNewUser Whether this is a new user or existing
   */
  private async registerAnonymousUser(isNewUser: boolean): Promise<void> {
    try {
      if (!this.currentUser) {
        return;
      }

      // Register or update the anonymous user on the server
      const endpoint = isNewUser ? 
        '/api/anonymous/register' : 
        '/api/anonymous/update';

      await apiService.post(endpoint, {
        anonymousId: this.currentUser.id,
        deviceInfo: this.currentUser.deviceInfo
      });

      // Track in analytics
      analyticsService.trackEvent(
        isNewUser ? AnalyticsEventType.USER_REGISTER : AnalyticsEventType.USER_LOGIN,
        {
          userId: this.currentUser.id,
          isAnonymous: true
        }
      );
    } catch (error) {
      console.error('Error registering anonymous user:', error);
      // Continue even if server registration fails
    }
  }

  /**
   * Check if the current device has been seen before
   * Useful for determining if we should show first-time experiences
   */
  async isReturningDevice(): Promise<boolean> {
    try {
      const userId = await storageService.getItem(ANONYMOUS_USER_ID_KEY);
      return !!userId;
    } catch (error) {
      console.error('Error checking returning device status:', error);
      return false;
    }
  }
}

export const anonymousAuthService = new AnonymousAuthService();