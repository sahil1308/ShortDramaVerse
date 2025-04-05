/**
 * useNotifications Hook
 * 
 * React hook for managing and responding to notifications in the application.
 * Handles permission requests, notification reception, and user interaction.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { notificationsService, NotificationType, NotificationData } from '@/services/notifications';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';
import { useAnonymousUser } from './useAnonymousUser';

export interface UseNotificationsResult {
  hasPermission: boolean;
  isLoading: boolean;
  lastNotification: Notifications.Notification | null;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (data: NotificationData, delaySeconds?: number) => Promise<string | null>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  getBadgeCount: () => Promise<number>;
}

export function useNotifications(): UseNotificationsResult {
  // State
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  
  // References
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Navigation for deep linking
  const navigation = useNavigation();
  
  // Get user info for tracking
  const { user } = useAnonymousUser();

  // Set up notifications on mount
  useEffect(() => {
    const setupNotifications = async () => {
      setIsLoading(true);
      
      try {
        // Initialize notification service
        const permissionStatus = await notificationsService.setup();
        setHasPermission(permissionStatus);
        
        // Listen for incoming notifications when app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
          notification => {
            setLastNotification(notification);
            
            // Track notification received
            analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_RECEIVED, {
              notification_id: notification.request.identifier,
              notification_type: notification.request.content.data?.type,
              user_id: user?.id,
              app_state: AppState.currentState,
            });
          }
        );
        
        // Listen for user interaction with notifications
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          response => {
            const { notification } = response;
            
            // Track notification interaction
            analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_CLICKED, {
              notification_id: notification.request.identifier,
              notification_type: notification.request.content.data?.type,
              user_id: user?.id,
              action_id: response.actionIdentifier,
            });
            
            // Handle notification action
            handleNotificationResponse(response);
          }
        );
        
        // Handle app state changes to refresh badge count
        AppState.addEventListener('change', handleAppStateChange);
      } catch (error) {
        console.error('Error in notifications setup:', error);
      } finally {
        setIsLoading(false);
      }
      
      return () => {
        // Clean up listeners
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
        
        // Remove app state listener
        AppState.removeEventListener('change', handleAppStateChange);
      };
    };
    
    setupNotifications();
  }, []);

  // Handle app state changes
  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    // When app comes to foreground
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // Reset badge count on iOS when app is opened
      if (Platform.OS === 'ios') {
        await notificationsService.setBadgeCount(0);
      }
    }
    
    // Update app state reference
    appState.current = nextAppState;
  }, []);

  // Handle notification responses and deep linking
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    const actionId = response.actionIdentifier;
    
    // If there's no data, we can't do anything
    if (!data) return;
    
    // Check if there's a deep link
    if (data.deepLink) {
      // Parse the deep link and navigate
      try {
        const url = new URL(data.deepLink as string);
        const path = url.pathname.split('/');
        
        if (path.length >= 2) {
          const routeName = path[1]; // e.g., 'episode' or 'series'
          const id = path[2]; // e.g., the episode or series id
          
          if (routeName === 'episode') {
            navigation.navigate('EpisodePlayer', { episodeId: parseInt(id) });
          } else if (routeName === 'series') {
            navigation.navigate('SeriesDetail', { seriesId: parseInt(id) });
          }
        }
      } catch (error) {
        console.error('Error parsing deep link:', error);
      }
    }
    
    // If there are specific actions defined
    if (data.actions) {
      const actions = data.actions as any[];
      const action = actions.find(a => a.id === actionId);
      
      if (action && action.navigateTo) {
        navigation.navigate(action.navigateTo, action.params || {});
      }
    }
  }, [navigation]);

  // Request notification permissions
  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const permissionStatus = await notificationsService.requestPermission();
      setHasPermission(permissionStatus);
      
      // Track permission request result
      analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_PERMISSION_CHANGE, {
        granted: permissionStatus,
        user_id: user?.id,
      });
      
      return permissionStatus;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Schedule a notification
  const scheduleNotification = useCallback(async (data: NotificationData, delaySeconds = 0) => {
    return await notificationsService.schedule(data, delaySeconds);
  }, []);

  // Cancel a notification
  const cancelNotification = useCallback(async (id: string) => {
    return await notificationsService.cancel(id);
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    return await notificationsService.cancelAll();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    return await notificationsService.setBadgeCount(count);
  }, []);

  // Get badge count
  const getBadgeCount = useCallback(async () => {
    return await notificationsService.getBadgeCount();
  }, []);

  return {
    hasPermission,
    isLoading,
    lastNotification,
    requestPermission,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    getBadgeCount,
  };
}