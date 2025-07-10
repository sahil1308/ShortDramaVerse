/**
 * Notification Manager Component
 * 
 * Manages in-app notifications and displays them as banners
 * when the app is in the foreground.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import NotificationBanner from './NotificationBanner';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationManager: React.FC = () => {
  // State
  const [currentNotification, setCurrentNotification] = useState<Notifications.Notification | null>(null);
  const [queue, setQueue] = useState<Notifications.Notification[]>([]);
  
  // Get notifications hook
  const { lastNotification } = useNotifications();
  
  // When a new notification comes in, add it to the queue
  useEffect(() => {
    if (lastNotification) {
      // Add new notification to the queue
      setQueue(prevQueue => [...prevQueue, lastNotification]);
    }
  }, [lastNotification]);
  
  // Process the queue
  useEffect(() => {
    // If there's no current notification and there are notifications in the queue
    if (!currentNotification && queue.length > 0) {
      // Get the next notification from the queue
      const nextNotification = queue[0];
      
      // Remove it from the queue
      setQueue(prevQueue => prevQueue.slice(1));
      
      // Set it as the current notification
      setCurrentNotification(nextNotification);
    }
  }, [currentNotification, queue]);
  
  // Handle notification dismissal
  const handleDismiss = () => {
    setCurrentNotification(null);
  };
  
  // If there's no current notification, don't render anything
  if (!currentNotification) {
    return null;
  }
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      <NotificationBanner
        notification={currentNotification}
        onDismiss={handleDismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999, // Make sure it's above everything else
    elevation: 999,
    pointerEvents: 'box-none', // Allow interactions with components underneath
  },
});

export default NotificationManager;