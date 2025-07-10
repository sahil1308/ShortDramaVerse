/**
 * Anonymous User Hook
 * 
 * Custom hook for accessing and managing anonymous user data.
 * Provides access to user ID and device identifiers.
 */
import { useState, useEffect, useCallback } from 'react';
import { deviceIdentifierService } from '@/services/deviceIdentifier';
import { storageService } from '@/services/storage';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';

// Storage keys
const ANONYMOUS_USER_KEY = 'anonymous_user';
const METADATA_KEY = 'user_metadata';

// Anonymous user data structure
export interface AnonymousUser {
  id: string;
  deviceId: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  metadata?: Record<string, any>;
}

interface UseAnonymousUserResult {
  user: AnonymousUser | null;
  isLoading: boolean;
  error: Error | null;
  resetUser: () => Promise<void>;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<void>;
}

/**
 * Hook for anonymous user management
 */
export function useAnonymousUser(): UseAnonymousUserResult {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize or load user data
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load existing user data from storage
      let userData = await storageService.getJsonItem<AnonymousUser>(ANONYMOUS_USER_KEY);
      
      if (userData) {
        // Update last seen time and visit count
        userData = {
          ...userData,
          lastSeen: new Date().toISOString(),
          visitCount: userData.visitCount + 1
        };
      } else {
        // Create new anonymous user if none exists
        const anonymousId = await deviceIdentifierService.getAnonymousId();
        const deviceId = await deviceIdentifierService.getDeviceId();
        
        userData = {
          id: anonymousId,
          deviceId,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          visitCount: 1
        };
        
        // Track new anonymous user
        analyticsService.trackEvent(AnalyticsEventType.USER_SIGNUP, {
          user_type: 'anonymous',
          device_id: deviceId
        });
      }
      
      // Load metadata if exists
      const metadata = await storageService.getJsonItem<Record<string, any>>(
        `${METADATA_KEY}_${userData.id}`
      );
      
      if (metadata) {
        userData.metadata = metadata;
      }
      
      // Save updated user data
      await storageService.setJsonItem(ANONYMOUS_USER_KEY, userData);
      
      setUser(userData);
    } catch (err) {
      console.error('Error loading anonymous user:', err);
      setError(err instanceof Error ? err : new Error('Failed to load user'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Effect to load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  // Reset anonymous user to new identity
  const resetUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current device ID
      const deviceId = await deviceIdentifierService.getDeviceId();
      
      // Reset anonymous ID
      const newAnonymousId = await deviceIdentifierService.resetAnonymousId();
      
      // Create new anonymous user
      const newUser: AnonymousUser = {
        id: newAnonymousId,
        deviceId,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        visitCount: 1
      };
      
      // Save new user data
      await storageService.setJsonItem(ANONYMOUS_USER_KEY, newUser);
      
      // Clear old metadata
      if (user?.id) {
        await storageService.removeItem(`${METADATA_KEY}_${user.id}`);
      }
      
      // Track user reset
      analyticsService.trackEvent(AnalyticsEventType.USER_SIGNUP, {
        user_type: 'anonymous',
        is_reset: true,
        device_id: deviceId
      });
      
      setUser(newUser);
    } catch (err) {
      console.error('Error resetting anonymous user:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset user'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Update user metadata
  const updateUserMetadata = useCallback(async (metadata: Record<string, any>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Merge with existing metadata
      const updatedMetadata = {
        ...(user.metadata || {}),
        ...metadata,
        lastUpdated: new Date().toISOString()
      };
      
      // Save metadata
      await storageService.setJsonItem(
        `${METADATA_KEY}_${user.id}`,
        updatedMetadata
      );
      
      // Update user object
      const updatedUser = {
        ...user,
        metadata: updatedMetadata
      };
      
      // Save updated user
      await storageService.setJsonItem(ANONYMOUS_USER_KEY, updatedUser);
      
      // Track metadata update
      analyticsService.trackEvent(AnalyticsEventType.PREFERENCE_UPDATE, {
        user_type: 'anonymous',
        metadata_keys: Object.keys(metadata)
      });
      
      setUser(updatedUser);
    } catch (err) {
      console.error('Error updating user metadata:', err);
      setError(err instanceof Error ? err : new Error('Failed to update metadata'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  return {
    user,
    isLoading,
    error,
    resetUser,
    updateUserMetadata
  };
}