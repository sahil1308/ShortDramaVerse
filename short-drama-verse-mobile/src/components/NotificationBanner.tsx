/**
 * Notification Banner Component
 * 
 * Displays an in-app notification banner when notifications are received
 * while the app is in the foreground. Supports images and interactive buttons.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { NotificationType } from '@/services/notifications';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';
import { useTheme } from '@/hooks/useTheme';

interface NotificationBannerProps {
  notification: Notifications.Notification;
  autoDismiss?: boolean;
  dismissAfter?: number; // in milliseconds
  onDismiss?: () => void;
  onPress?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  autoDismiss = true,
  dismissAfter = 5000,
  onDismiss,
  onPress,
}) => {
  // State
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Dimensions
  const { width } = useWindowDimensions();
  
  // Animation value
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Dismiss timer
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Navigation
  const navigation = useNavigation();
  
  // Theme
  const { isDarkMode } = useTheme();
  
  // Notification content
  const { title, body, data } = notification.request.content;
  const notificationType = data?.type as NotificationType;
  const imageUrl = data?.imageUrl as string | undefined;
  const actions = data?.actions as any[] | undefined;
  
  // Handle notification press
  const handlePress = () => {
    // Call the onPress callback if provided
    if (onPress) {
      onPress();
    } else {
      // Handle deep linking
      if (data?.deepLink) {
        try {
          const url = new URL(data.deepLink as string);
          const path = url.pathname.split('/');
          
          if (path.length >= 2) {
            const routeName = path[1];
            const id = path[2];
            
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
      
      // If no deep link, navigate to a default screen based on type
      else {
        switch (notificationType) {
          case NotificationType.NEW_EPISODE:
          case NotificationType.SERIES_UPDATE:
            if (data?.metadata?.episodeId) {
              navigation.navigate('EpisodePlayer', { episodeId: data.metadata.episodeId });
            }
            break;
          case NotificationType.SPECIAL_OFFER:
            navigation.navigate('OffersScreen');
            break;
          default:
            break;
        }
      }
    }
    
    // Track banner interaction
    analyticsService.trackEvent(AnalyticsEventType.IN_APP_NOTIFICATION_CLICK, {
      notification_id: notification.request.identifier,
      notification_type: notificationType,
    });
    
    // Dismiss the banner
    handleDismiss();
  };

  // Handle action button press
  const handleActionPress = (action: any) => {
    // Track action press
    analyticsService.trackEvent(AnalyticsEventType.IN_APP_NOTIFICATION_ACTION, {
      notification_id: notification.request.identifier,
      action_id: action.id,
    });
    
    // Navigate if needed
    if (action.navigateTo) {
      navigation.navigate(action.navigateTo, action.params || {});
    }
    
    // Dismiss the banner
    handleDismiss();
  };

  // Dismiss the notification banner
  const handleDismiss = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call the onDismiss callback if provided
      if (onDismiss) {
        onDismiss();
      }
      
      // Clear dismiss timer
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    });
  };

  // Set up animation and dismiss timer on mount
  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Set up auto-dismiss timer
    if (autoDismiss) {
      dismissTimerRef.current = setTimeout(handleDismiss, dismissAfter);
    }
    
    // Track banner shown
    analyticsService.trackEvent(AnalyticsEventType.IN_APP_NOTIFICATION_SHOW, {
      notification_id: notification.request.identifier,
      notification_type: notificationType,
    });
    
    // Clean up timer on unmount
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  // Get icon based on notification type
  const getNotificationIcon = () => {
    switch (notificationType) {
      case NotificationType.NEW_EPISODE:
        return <FontAwesome name="play-circle" size={24} color={isDarkMode ? '#fff' : '#333'} />;
      case NotificationType.SERIES_UPDATE:
        return <FontAwesome name="film" size={22} color={isDarkMode ? '#fff' : '#333'} />;
      case NotificationType.CONTENT_RECOMMENDATION:
        return <FontAwesome name="star" size={24} color={isDarkMode ? '#fff' : '#333'} />;
      case NotificationType.SPECIAL_OFFER:
        return <FontAwesome name="tag" size={24} color={isDarkMode ? '#fff' : '#333'} />;
      case NotificationType.WATCHLIST_REMINDER:
        return <FontAwesome name="bookmark" size={24} color={isDarkMode ? '#fff' : '#333'} />;
      case NotificationType.ACCOUNT_UPDATE:
        return <FontAwesome name="user-circle" size={24} color={isDarkMode ? '#fff' : '#333'} />;
      default:
        return <FontAwesome name="bell" size={24} color={isDarkMode ? '#fff' : '#333'} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          width: width - 20,
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 60 : 100}
        tint={isDarkMode ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <TouchableOpacity
          style={styles.contentContainer}
          activeOpacity={0.8}
          onPress={handlePress}
        >
          {/* Left icon section */}
          <View style={styles.iconContainer}>
            {getNotificationIcon()}
          </View>
          
          {/* Middle text section */}
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.title, 
                isDarkMode && styles.textLight
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text 
              style={[
                styles.body, 
                isDarkMode && styles.textLight
              ]} 
              numberOfLines={2}
            >
              {body}
            </Text>
          </View>
          
          {/* Right close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            <MaterialIcons 
              name="close" 
              size={20} 
              color={isDarkMode ? '#ddd' : '#777'} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {/* Banner image */}
        {imageUrl && !imageError && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={[
                styles.image,
                !imageLoaded && styles.hiddenImage,
              ]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="image" size={24} color="#ccc" />
              </View>
            )}
          </View>
        )}
        
        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.id || index}
                style={[
                  styles.actionButton,
                  index === 0 && styles.primaryActionButton,
                  index === actions.length - 1 && { marginRight: 0 },
                ]}
                onPress={() => handleActionPress(action)}
              >
                <Text
                  style={[
                    styles.actionText,
                    index === 0 && styles.primaryActionText,
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    alignSelf: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 94, 58, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  textLight: {
    color: '#fff',
  },
  body: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryActionButton: {
    backgroundColor: '#ff5e3a',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  primaryActionText: {
    color: '#fff',
  },
});

export default NotificationBanner;