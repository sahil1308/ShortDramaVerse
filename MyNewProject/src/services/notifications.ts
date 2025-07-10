/**
 * Notifications Service
 * 
 * Manages push notifications including rich media notifications with banners
 * for both iOS and Android platforms.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { analyticsService, AnalyticsEventType } from './analytics';
import { storageService } from './storage';
import { deviceIdentifierService } from './deviceIdentifier';

// Constants
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const NOTIFICATION_CHANNEL_ID = 'shortdramaverse-notifications';
const NOTIFICATION_CHANNEL_NAME = 'ShortDramaVerse Alerts';

export enum NotificationType {
  NEW_EPISODE = 'new_episode',
  SERIES_UPDATE = 'series_update',
  CONTENT_RECOMMENDATION = 'content_recommendation',
  SPECIAL_OFFER = 'special_offer',
  WATCHLIST_REMINDER = 'watchlist_reminder',
  ACCOUNT_UPDATE = 'account_update',
  CUSTOM = 'custom'
}

export interface NotificationAction {
  id: string;
  title: string;
  navigateTo?: string;
  params?: Record<string, any>;
}

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string; // URL for banner image shown in the notification
  deepLink?: string; // Deep link for navigation when notification is tapped
  actions?: NotificationAction[]; // Additional actions for the notification
  metadata?: Record<string, any>; // Additional data for analytics or handling
  channelId?: string; // Android-specific channel ID
  sound?: boolean; // Whether to play a sound
  badge?: number; // iOS badge count
  priority?: 'default' | 'high' | 'max'; // Android notification priority
}

/**
 * Sets up notification channels and permissions
 */
export async function setupNotifications(): Promise<boolean> {
  try {
    // Configure notifications appearance
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up notification categories (for iOS action buttons)
    await setupNotificationCategories();

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await createNotificationChannels();
    }

    // Request permissions
    const permissionStatus = await requestNotificationPermission();

    // Store permission state
    await storageService.setItem(NOTIFICATIONS_ENABLED_KEY, permissionStatus.toString());

    // Track notification setup in analytics
    analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_SETUP, {
      permissions_granted: permissionStatus,
      platform: Platform.OS,
      device_id: await deviceIdentifierService.getDeviceId()
    });

    return permissionStatus;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}

/**
 * Creates the notification channels for Android
 */
async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  // Main notification channel
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: NOTIFICATION_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF5E3A',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    enableLights: true,
    showBadge: true,
    sound: 'default',
  });
  
  // High priority notification channel for important updates
  await Notifications.setNotificationChannelAsync('shortdramaverse-important', {
    name: 'Important Updates',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250, 250, 250],
    lightColor: '#FF3A3A',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    enableLights: true,
    showBadge: true,
    sound: 'default',
  });
}

/**
 * Sets up notification categories for iOS action buttons
 */
async function setupNotificationCategories(): Promise<void> {
  // Skip if not iOS
  if (Platform.OS !== 'ios') return;
  
  await Notifications.setNotificationCategoryAsync('episode', {
    actions: [
      {
        identifier: 'watch',
        buttonTitle: 'Watch Now',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
          opensAppToForeground: true,
        }
      },
      {
        identifier: 'remind',
        buttonTitle: 'Remind Later',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
          opensAppToForeground: false,
        }
      }
    ],
  });
  
  await Notifications.setNotificationCategoryAsync('offer', {
    actions: [
      {
        identifier: 'view',
        buttonTitle: 'View Offer',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
          opensAppToForeground: true,
        }
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Not Now',
        options: {
          isDestructive: true,
          isAuthenticationRequired: false,
          opensAppToForeground: false,
        }
      }
    ],
  });
}

/**
 * Requests notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    
    let finalStatus = existingStatus;
    
    // Only ask for permission if not determined
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedules a local notification with rich content
 */
export async function scheduleNotification(
  notificationData: NotificationData,
  triggerSeconds: number = 0
): Promise<string | null> {
  try {
    // Determine if we should show this type of notification
    const isEnabled = await isNotificationTypeEnabled(notificationData.type);
    if (!isEnabled) {
      return null;
    }
    
    // For Android, set appropriate channel ID
    const androidConfig = Platform.OS === 'android' ? {
      channelId: notificationData.channelId || NOTIFICATION_CHANNEL_ID,
      color: '#FF5E3A', // Brand color
    } : {};
    
    // For iOS, set category for action buttons
    const iosConfig = Platform.OS === 'ios' ? {
      categoryIdentifier: getCategoryForNotificationType(notificationData.type),
    } : {};

    // Set up notification content
    const notificationContent: Notifications.NotificationContentInput = {
      title: notificationData.title,
      body: notificationData.body,
      data: {
        type: notificationData.type,
        deepLink: notificationData.deepLink,
        actions: notificationData.actions,
        metadata: notificationData.metadata || {},
      },
      sound: notificationData.sound !== false,
      badge: notificationData.badge,
      ...androidConfig,
      ...iosConfig,
    };
    
    // Add rich image if provided (works on both iOS and Android)
    if (notificationData.imageUrl) {
      // For attachments to work properly, the URL must be accessible
      notificationContent.attachments = [
        {
          identifier: `image-${Date.now()}`,
          url: notificationData.imageUrl,
          // For iOS specifically
          options: {
            typeHint: 'image'
          }
        }
      ];
    }
    
    // Schedule the notification
    const trigger = triggerSeconds > 0 
      ? { seconds: triggerSeconds } 
      : null;
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });
    
    // Track notification scheduled in analytics
    analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_SCHEDULED, {
      notification_id: notificationId,
      notification_type: notificationData.type,
      has_image: !!notificationData.imageUrl,
      scheduled_for: trigger ? new Date(Date.now() + triggerSeconds * 1000).toISOString() : 'immediate'
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Returns whether a notification type is enabled by the user
 */
async function isNotificationTypeEnabled(type: NotificationType): Promise<boolean> {
  // Get global notification setting
  const notificationsEnabled = await storageService.getItem(NOTIFICATIONS_ENABLED_KEY);
  if (notificationsEnabled !== 'true') {
    return false;
  }
  
  // Check specific notification type setting
  const typeKey = `notification_${type}_enabled`;
  const typeEnabled = await storageService.getItem(typeKey);
  
  // If setting doesn't exist, default to true for most notifications
  if (typeEnabled === null) {
    // Default special offers to off unless explicitly enabled
    if (type === NotificationType.SPECIAL_OFFER) {
      return false;
    }
    return true;
  }
  
  return typeEnabled === 'true';
}

/**
 * Maps notification types to iOS categories
 */
function getCategoryForNotificationType(type: NotificationType): string {
  switch (type) {
    case NotificationType.NEW_EPISODE:
    case NotificationType.SERIES_UPDATE:
    case NotificationType.WATCHLIST_REMINDER:
      return 'episode';
    case NotificationType.SPECIAL_OFFER:
      return 'offer';
    default:
      return ''; // Default category
  }
}

/**
 * Cancels a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    
    // Track cancellation in analytics
    analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_CANCELLED, {
      notification_id: notificationId,
    });
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancels all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Track in analytics
    analyticsService.trackEvent(AnalyticsEventType.NOTIFICATIONS_CANCELLED_ALL, {});
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Gets the badge count for iOS
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS !== 'ios') {
    return 0;
  }
  
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Sets the badge count for iOS
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }
  
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Gets all pending notification requests
 */
export async function getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
}

/**
 * Example notification for a new episode
 */
export async function sendNewEpisodeNotification(
  seriesId: number, 
  episodeId: number,
  episodeTitle: string,
  seriesTitle: string,
  imageUrl?: string
): Promise<string | null> {
  const notificationData: NotificationData = {
    type: NotificationType.NEW_EPISODE,
    title: `New Episode: ${seriesTitle}`,
    body: `"${episodeTitle}" is now available to watch!`,
    imageUrl: imageUrl,
    deepLink: `shortdramaverse://episode/${episodeId}`,
    actions: [
      {
        id: 'watch',
        title: 'Watch Now',
        navigateTo: 'EpisodePlayer',
        params: { episodeId }
      },
      {
        id: 'series',
        title: 'View Series',
        navigateTo: 'SeriesDetail',
        params: { seriesId }
      }
    ],
    metadata: {
      seriesId,
      episodeId
    },
    priority: 'high'
  };
  
  return await scheduleNotification(notificationData);
}

// Create a singleton service for external use
export const notificationsService = {
  setup: setupNotifications,
  requestPermission: requestNotificationPermission,
  schedule: scheduleNotification,
  cancel: cancelNotification,
  cancelAll: cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  getPendingNotifications,
  sendNewEpisodeNotification,
};