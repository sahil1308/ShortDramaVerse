/**
 * Notification Settings Screen
 * 
 * Allows users to manage their notification preferences
 * including toggling specific notification types.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationsService, NotificationType } from '@/services/notifications';
import { storageService } from '@/services/storage';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';
import { useTheme } from '@/hooks/useTheme';

const NotificationSettingsScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation();
  
  // Theme
  const { isDarkMode } = useTheme();
  
  // Get notifications hook
  const { hasPermission, isLoading, requestPermission } = useNotifications();
  
  // Notification settings state
  const [masterEnabled, setMasterEnabled] = useState<boolean>(false);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    [NotificationType.NEW_EPISODE]: true,
    [NotificationType.SERIES_UPDATE]: true,
    [NotificationType.CONTENT_RECOMMENDATION]: true,
    [NotificationType.SPECIAL_OFFER]: false,
    [NotificationType.WATCHLIST_REMINDER]: true,
    [NotificationType.ACCOUNT_UPDATE]: true,
  });
  
  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      setSettingsLoading(true);
      
      try {
        // Load master setting
        const enabled = await storageService.getItem('notifications_enabled');
        setMasterEnabled(enabled === 'true');
        
        // Load individual settings
        const settings: Record<string, boolean> = {};
        
        for (const type of Object.values(NotificationType)) {
          const value = await storageService.getItem(`notification_${type}_enabled`);
          
          // If the value is null (not set yet), use the default
          if (value === null) {
            settings[type] = type !== NotificationType.SPECIAL_OFFER;
          } else {
            settings[type] = value === 'true';
          }
        }
        
        setNotificationSettings(settings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    
    loadSettings();
  }, [hasPermission]);
  
  // Toggle master setting
  const toggleMasterSetting = async () => {
    if (!hasPermission && !masterEnabled) {
      // Request permission if we don't have it and are trying to enable
      const granted = await requestPermission();
      
      if (!granted) {
        // Show alert if permission wasn't granted
        Alert.alert(
          'Permission Required',
          'To receive notifications, you need to grant permission in your device settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // This would open the app settings page
                // For a real app, use something like react-native-permissions
                // to open the settings
              },
            },
          ]
        );
        return;
      }
    }
    
    const newValue = !masterEnabled;
    setMasterEnabled(newValue);
    
    // Save the setting
    await storageService.setItem('notifications_enabled', newValue.toString());
    
    // Track setting change
    analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_SETTING_CHANGE, {
      setting: 'master',
      value: newValue,
    });
  };
  
  // Toggle individual notification type
  const toggleNotificationType = async (type: NotificationType) => {
    const newValue = !notificationSettings[type];
    
    // Update state
    setNotificationSettings(prev => ({
      ...prev,
      [type]: newValue,
    }));
    
    // Save the setting
    await storageService.setItem(`notification_${type}_enabled`, newValue.toString());
    
    // Track setting change
    analyticsService.trackEvent(AnalyticsEventType.NOTIFICATION_SETTING_CHANGE, {
      setting: type,
      value: newValue,
    });
  };
  
  // Send a test notification
  const sendTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'To receive notifications, you need to grant permission first.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Request Permission',
            onPress: requestPermission,
          },
        ]
      );
      return;
    }
    
    await notificationsService.sendNewEpisodeNotification(
      123, // Example series ID
      456, // Example episode ID
      'Test Episode',
      'Test Series',
      'https://example.com/image.jpg' // Example image URL
    );
    
    Alert.alert(
      'Test Notification Sent',
      'A test notification has been sent. You should receive it shortly.',
      [{ text: 'OK' }]
    );
  };
  
  if (isLoading || settingsLoading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.textLight]}>
            Notification Settings
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff5e3a" />
          <Text style={[styles.loadingText, isDarkMode && styles.textLight]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textLight]}>
          Notification Settings
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Master toggle */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                Enable Notifications
              </Text>
              <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                Turn on notifications for important updates and new content
              </Text>
            </View>
            <Switch
              value={masterEnabled}
              onValueChange={toggleMasterSetting}
              trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
              thumbColor={Platform.OS === 'ios' ? undefined : masterEnabled ? '#ff5e3a' : '#f4f3f4'}
              ios_backgroundColor="#d1d1d1"
            />
          </View>
          
          {!hasPermission && masterEnabled && (
            <View style={styles.permissionWarning}>
              <FontAwesome name="exclamation-triangle" size={16} color="#ff9500" />
              <Text style={styles.permissionWarningText}>
                Notifications are not enabled in your device settings
              </Text>
              <TouchableOpacity onPress={requestPermission}>
                <Text style={styles.permissionActionText}>Enable</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Individual notification types */}
        {masterEnabled && (
          <View style={[styles.section, isDarkMode && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
              Notification Types
            </Text>
            
            {/* New episodes */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                  New Episodes
                </Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                  Get notified when new episodes are released
                </Text>
              </View>
              <Switch
                value={notificationSettings[NotificationType.NEW_EPISODE]}
                onValueChange={() => toggleNotificationType(NotificationType.NEW_EPISODE)}
                trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
                thumbColor={
                  Platform.OS === 'ios' 
                    ? undefined 
                    : notificationSettings[NotificationType.NEW_EPISODE] 
                      ? '#ff5e3a' 
                      : '#f4f3f4'
                }
                ios_backgroundColor="#d1d1d1"
              />
            </View>
            
            {/* Series updates */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                  Series Updates
                </Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                  Get notified about updates to series you follow
                </Text>
              </View>
              <Switch
                value={notificationSettings[NotificationType.SERIES_UPDATE]}
                onValueChange={() => toggleNotificationType(NotificationType.SERIES_UPDATE)}
                trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
                thumbColor={
                  Platform.OS === 'ios' 
                    ? undefined 
                    : notificationSettings[NotificationType.SERIES_UPDATE] 
                      ? '#ff5e3a' 
                      : '#f4f3f4'
                }
                ios_backgroundColor="#d1d1d1"
              />
            </View>
            
            {/* Recommendations */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                  Recommendations
                </Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                  Get personalized content recommendations
                </Text>
              </View>
              <Switch
                value={notificationSettings[NotificationType.CONTENT_RECOMMENDATION]}
                onValueChange={() => toggleNotificationType(NotificationType.CONTENT_RECOMMENDATION)}
                trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
                thumbColor={
                  Platform.OS === 'ios' 
                    ? undefined 
                    : notificationSettings[NotificationType.CONTENT_RECOMMENDATION] 
                      ? '#ff5e3a' 
                      : '#f4f3f4'
                }
                ios_backgroundColor="#d1d1d1"
              />
            </View>
            
            {/* Special offers */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                  Special Offers
                </Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                  Get notified about special deals and promotions
                </Text>
              </View>
              <Switch
                value={notificationSettings[NotificationType.SPECIAL_OFFER]}
                onValueChange={() => toggleNotificationType(NotificationType.SPECIAL_OFFER)}
                trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
                thumbColor={
                  Platform.OS === 'ios' 
                    ? undefined 
                    : notificationSettings[NotificationType.SPECIAL_OFFER] 
                      ? '#ff5e3a' 
                      : '#f4f3f4'
                }
                ios_backgroundColor="#d1d1d1"
              />
            </View>
            
            {/* Watchlist reminders */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                  Watchlist Reminders
                </Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                  Get reminded about content in your watchlist
                </Text>
              </View>
              <Switch
                value={notificationSettings[NotificationType.WATCHLIST_REMINDER]}
                onValueChange={() => toggleNotificationType(NotificationType.WATCHLIST_REMINDER)}
                trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
                thumbColor={
                  Platform.OS === 'ios' 
                    ? undefined 
                    : notificationSettings[NotificationType.WATCHLIST_REMINDER] 
                      ? '#ff5e3a' 
                      : '#f4f3f4'
                }
                ios_backgroundColor="#d1d1d1"
              />
            </View>
            
            {/* Account updates */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, isDarkMode && styles.textLight]}>
                  Account Updates
                </Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.textLightSecondary]}>
                  Get notified about account-related changes
                </Text>
              </View>
              <Switch
                value={notificationSettings[NotificationType.ACCOUNT_UPDATE]}
                onValueChange={() => toggleNotificationType(NotificationType.ACCOUNT_UPDATE)}
                trackColor={{ false: '#d1d1d1', true: '#ff7d5a' }}
                thumbColor={
                  Platform.OS === 'ios' 
                    ? undefined 
                    : notificationSettings[NotificationType.ACCOUNT_UPDATE] 
                      ? '#ff5e3a' 
                      : '#f4f3f4'
                }
                ios_backgroundColor="#d1d1d1"
              />
            </View>
          </View>
        )}
        
        {/* Test notification button */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <TouchableOpacity 
            style={[
              styles.testButton,
              (!masterEnabled || !hasPermission) && styles.testButtonDisabled
            ]}
            onPress={sendTestNotification}
            disabled={!masterEnabled || !hasPermission}
          >
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
          
          <Text style={[styles.testDescription, isDarkMode && styles.textLightSecondary]}>
            Sends a sample notification to test your current settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1e1e1e',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  permissionWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#ff9500',
    marginLeft: 8,
  },
  permissionActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff5e3a',
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: '#ff5e3a',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  textLight: {
    color: '#fff',
  },
  textLightSecondary: {
    color: '#aaa',
  },
});

export default NotificationSettingsScreen;