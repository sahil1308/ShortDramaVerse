/**
 * Notifications Service
 * 
 * This service handles push notifications, local notifications,
 * and notification preferences for the ShortDramaVerse application.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATION_HISTORY_KEY = 'notification_history';

export interface NotificationSettings {
  pushNotifications: boolean;
  newContentAlerts: boolean;
  recommendationAlerts: boolean;
  systemNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'content' | 'recommendation' | 'system';
  data?: Record<string, any>;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const defaultNotificationSettings: NotificationSettings = {
  pushNotifications: true,
  newContentAlerts: true,
  recommendationAlerts: true,
  systemNotifications: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  soundEnabled: true,
  vibrationEnabled: true,
  frequency: 'immediate',
};

/**
 * Initialize notifications system
 */
export const initializeNotifications = async (): Promise<void> => {
  try {
    // Check if settings exist, if not create default
    const settings = await getNotificationSettings();
    if (!settings) {
      await updateNotificationSettings('default', defaultNotificationSettings);
    }
    
    console.log('Notifications initialized');
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};

/**
 * Get notification settings for a user
 */
export const getNotificationSettings = async (userId: string): Promise<NotificationSettings> => {
  try {
    const settingsData = await AsyncStorage.getItem(`${NOTIFICATION_SETTINGS_KEY}_${userId}`);
    
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      return { ...defaultNotificationSettings, ...settings };
    }
    
    return defaultNotificationSettings;
  } catch (error) {
    console.error('Failed to get notification settings:', error);
    return defaultNotificationSettings;
  }
};

/**
 * Update notification settings for a user
 */
export const updateNotificationSettings = async (
  userId: string, 
  settings: Partial<NotificationSettings>
): Promise<void> => {
  try {
    const currentSettings = await getNotificationSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(
      `${NOTIFICATION_SETTINGS_KEY}_${userId}`, 
      JSON.stringify(updatedSettings)
    );
    
    console.log('Notification settings updated for user:', userId);
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error;
  }
};

/**
 * Check if notifications are allowed at current time
 */
export const areNotificationsAllowed = async (userId: string): Promise<boolean> => {
  try {
    const settings = await getNotificationSettings(userId);
    
    if (!settings.pushNotifications) {
      return false;
    }
    
    if (!settings.quietHoursEnabled) {
      return true;
    }
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Simple time comparison (assumes same day)
    const startTime = settings.quietHoursStart;
    const endTime = settings.quietHoursEnd;
    
    if (startTime <= endTime) {
      // Normal case: 08:00 - 22:00
      return currentTime < startTime || currentTime > endTime;
    } else {
      // Overnight case: 22:00 - 08:00
      return currentTime > endTime && currentTime < startTime;
    }
  } catch (error) {
    console.error('Failed to check notification permissions:', error);
    return true; // Default to allowing notifications
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (
  userId: string,
  notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>
): Promise<void> => {
  try {
    const settings = await getNotificationSettings(userId);
    const allowed = await areNotificationsAllowed(userId);
    
    if (!allowed) {
      console.log('Notifications not allowed at this time');
      return;
    }
    
    // Check specific notification type settings
    if (notification.type === 'content' && !settings.newContentAlerts) {
      return;
    }
    if (notification.type === 'recommendation' && !settings.recommendationAlerts) {
      return;
    }
    if (notification.type === 'system' && !settings.systemNotifications) {
      return;
    }
    
    const notificationItem: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    // Store notification in history
    await addNotificationToHistory(userId, notificationItem);
    
    // In a real app, this would trigger the actual notification
    console.log('Local notification sent:', notificationItem);
  } catch (error) {
    console.error('Failed to send local notification:', error);
  }
};

/**
 * Schedule notification for later
 */
export const scheduleNotification = async (
  userId: string,
  notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>,
  scheduleTime: Date
): Promise<void> => {
  try {
    // In a real app, this would use a scheduling library
    const delay = scheduleTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        sendLocalNotification(userId, notification);
      }, delay);
      
      console.log('Notification scheduled for:', scheduleTime);
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

/**
 * Get notification history for a user
 */
export const getNotificationHistory = async (userId: string): Promise<NotificationItem[]> => {
  try {
    const historyData = await AsyncStorage.getItem(`${NOTIFICATION_HISTORY_KEY}_${userId}`);
    
    if (historyData) {
      const history = JSON.parse(historyData);
      return history.sort((a: NotificationItem, b: NotificationItem) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    
    return [];
  } catch (error) {
    console.error('Failed to get notification history:', error);
    return [];
  }
};

/**
 * Add notification to history
 */
export const addNotificationToHistory = async (
  userId: string, 
  notification: NotificationItem
): Promise<void> => {
  try {
    const history = await getNotificationHistory(userId);
    history.unshift(notification);
    
    // Keep only last 100 notifications
    if (history.length > 100) {
      history.splice(100);
    }
    
    await AsyncStorage.setItem(
      `${NOTIFICATION_HISTORY_KEY}_${userId}`, 
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('Failed to add notification to history:', error);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  userId: string, 
  notificationId: string
): Promise<void> => {
  try {
    const history = await getNotificationHistory(userId);
    const notification = history.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      await AsyncStorage.setItem(
        `${NOTIFICATION_HISTORY_KEY}_${userId}`, 
        JSON.stringify(history)
      );
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const history = await getNotificationHistory(userId);
    
    history.forEach(notification => {
      notification.isRead = true;
    });
    
    await AsyncStorage.setItem(
      `${NOTIFICATION_HISTORY_KEY}_${userId}`, 
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const history = await getNotificationHistory(userId);
    return history.filter(n => !n.isRead).length;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
};

/**
 * Clear notification history
 */
export const clearNotificationHistory = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${NOTIFICATION_HISTORY_KEY}_${userId}`);
  } catch (error) {
    console.error('Failed to clear notification history:', error);
  }
};

/**
 * Send content notification
 */
export const sendContentNotification = async (
  userId: string,
  contentTitle: string,
  contentId: string
): Promise<void> => {
  await sendLocalNotification(userId, {
    title: 'New Episode Available!',
    body: `New episode of "${contentTitle}" is now available to watch.`,
    type: 'content',
    data: { contentId },
    actionUrl: `/video/${contentId}`,
  });
};

/**
 * Send recommendation notification
 */
export const sendRecommendationNotification = async (
  userId: string,
  recommendedContent: string[]
): Promise<void> => {
  await sendLocalNotification(userId, {
    title: 'New Recommendations',
    body: 'We found some new shows you might like based on your viewing history.',
    type: 'recommendation',
    data: { recommendedContent },
    actionUrl: '/home',
  });
};

/**
 * Send system notification
 */
export const sendSystemNotification = async (
  userId: string,
  title: string,
  message: string
): Promise<void> => {
  await sendLocalNotification(userId, {
    title,
    body: message,
    type: 'system',
  });
};