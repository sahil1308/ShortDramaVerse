/**
 * Anonymous Authentication Service
 * 
 * Handles device identification and anonymous user tracking.
 * Assigns unique IDs to users without requiring registration.
 */
import { storageService } from './storage';
import { deviceIdentifierService } from './deviceIdentifier';
import { apiService } from './api';
import { analyticsService } from './analytics';
import { AnalyticsEventType } from './analytics';
import uuid from 'react-native-uuid';

// Anonymous user interface
export interface AnonymousUser {
  id: string;
  deviceIdentifiers: Record<string, string>;
  firstSeen: string;
  lastSeen: string;
  totalVisits: number;
}

// Storage keys
const STORAGE_KEYS = {
  anonymousUser: 'anonymous_user',
  deviceIdentifiers: 'device_identifiers'
};

// API endpoints
const API_ENDPOINTS = {
  anonymousUser: '/user/anonymous'
};

class AnonymousAuthService {
  private currentUser: AnonymousUser | null = null;
  private isInitialized = false;
  
  /**
   * Initialize the anonymous authentication service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Try to get existing anonymous user from storage
      const storedUser = await storageService.getJsonItem<AnonymousUser>(STORAGE_KEYS.anonymousUser);
      
      if (storedUser) {
        // Update last seen time and increment visit count
        this.currentUser = {
          ...storedUser,
          lastSeen: new Date().toISOString(),
          totalVisits: (storedUser.totalVisits || 0) + 1
        };
        
        // Update device identifiers in case they've changed
        const deviceIds = await deviceIdentifierService.getAllIdentifiers();
        this.currentUser.deviceIdentifiers = {
          ...this.currentUser.deviceIdentifiers,
          ...deviceIds
        };
        
        // Save updated user data
        await storageService.setJsonItem(STORAGE_KEYS.anonymousUser, this.currentUser);
        
        // Sync with server
        this.syncWithServer(this.currentUser);
      } else {
        // Create new anonymous user
        await this.createAnonymousUser();
      }
      
      this.isInitialized = true;
      
      // Track user session start
      analyticsService.trackEvent(AnalyticsEventType.SESSION_START, {
        anonymous_id: this.currentUser?.id,
        total_visits: this.currentUser?.totalVisits
      });
    } catch (error) {
      console.error('Error initializing anonymous authentication:', error);
    }
  }
  
  /**
   * Create a new anonymous user
   */
  private async createAnonymousUser(): Promise<void> {
    try {
      // Get device identifiers
      const deviceIds = await deviceIdentifierService.getAllIdentifiers();
      
      // Create new user object
      const newUser: AnonymousUser = {
        id: uuid.v4().toString(),
        deviceIdentifiers: deviceIds,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalVisits: 1
      };
      
      // Save to storage
      await storageService.setJsonItem(STORAGE_KEYS.anonymousUser, newUser);
      this.currentUser = newUser;
      
      // Register with server
      this.registerWithServer(newUser);
      
      // Track new anonymous user creation
      analyticsService.trackEvent(AnalyticsEventType.NEW_USER, {
        anonymous_id: newUser.id,
        device_count: Object.keys(deviceIds).length
      });
    } catch (error) {
      console.error('Error creating anonymous user:', error);
    }
  }
  
  /**
   * Register anonymous user with server
   */
  private async registerWithServer(user: AnonymousUser): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.anonymousUser, user);
    } catch (error) {
      console.error('Error registering anonymous user with server:', error);
      // Non-blocking error - will try again later
    }
  }
  
  /**
   * Sync user data with server
   */
  private async syncWithServer(user: AnonymousUser): Promise<void> {
    try {
      await apiService.put(`${API_ENDPOINTS.anonymousUser}/${user.id}`, user);
    } catch (error) {
      console.error('Error syncing anonymous user with server:', error);
      // Non-blocking error - will try again later
    }
  }
  
  /**
   * Get the current anonymous user
   * Initializes if not already done
   */
  async getCurrentUser(): Promise<AnonymousUser> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.currentUser) {
      throw new Error('Failed to initialize anonymous user');
    }
    
    return this.currentUser;
  }
  
  /**
   * Check if an anonymous user exists on this device
   */
  async hasExistingUser(): Promise<boolean> {
    return !!(await storageService.getJsonItem<AnonymousUser>(STORAGE_KEYS.anonymousUser));
  }
  
  /**
   * Reset the anonymous user
   * This is typically used when a user logs out
   */
  async resetAnonymousUser(): Promise<void> {
    try {
      // Track user reset
      if (this.currentUser) {
        analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
          name: 'anonymous_user_reset',
          anonymous_id: this.currentUser.id
        });
      }
      
      // Remove from storage
      await storageService.removeItem(STORAGE_KEYS.anonymousUser);
      
      // Create new anonymous user
      await this.createAnonymousUser();
    } catch (error) {
      console.error('Error resetting anonymous user:', error);
    }
  }
  
  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: Record<string, any>): Promise<void> {
    try {
      if (!this.currentUser) {
        await this.getCurrentUser();
      }
      
      // Update user with metadata
      this.currentUser = {
        ...this.currentUser!,
        ...metadata,
        lastSeen: new Date().toISOString()
      };
      
      // Save to storage
      await storageService.setJsonItem(STORAGE_KEYS.anonymousUser, this.currentUser);
      
      // Sync with server
      this.syncWithServer(this.currentUser);
    } catch (error) {
      console.error('Error updating anonymous user metadata:', error);
    }
  }
}

// Export singleton instance
export const anonymousAuthService = new AnonymousAuthService();