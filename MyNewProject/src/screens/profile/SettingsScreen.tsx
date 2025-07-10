import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../hooks/useAuth';
import { UserPreferences } from '../../types/preferences';
import { subscriptionService } from '../../services/subscription';
import { notificationService } from '../../services/notifications';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { trackEvent } = useAnalytics();
  const { user, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [dataOptimizationEnabled, setDataOptimizationEnabled] = useState(false);
  const [adPersonalizationEnabled, setAdPersonalizationEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (preferences) {
        setNotificationsEnabled(preferences.notifications?.enabled ?? true);
        setAutoPlayEnabled(preferences.playback?.autoPlay ?? true);
        setDataOptimizationEnabled(preferences.general?.dataOptimization ?? false);
        setAdPersonalizationEnabled(preferences.ads?.personalization ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      
      if (value) {
        await notificationService.requestPermissions();
      } else {
        await notificationService.disableNotifications();
      }
      
      await updatePreferences({
        notifications: {
          ...preferences?.notifications,
          enabled: value
        }
      });
      
      trackEvent('settings_notifications_toggled', { enabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleAutoPlayToggle = async (value: boolean) => {
    try {
      setAutoPlayEnabled(value);
      
      await updatePreferences({
        playback: {
          ...preferences?.playback,
          autoPlay: value
        }
      });
      
      trackEvent('settings_autoplay_toggled', { enabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-play settings');
    }
  };

  const handleDataOptimizationToggle = async (value: boolean) => {
    try {
      setDataOptimizationEnabled(value);
      
      await updatePreferences({
        general: {
          ...preferences?.general,
          dataOptimization: value
        }
      });
      
      trackEvent('settings_data_optimization_toggled', { enabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update data optimization settings');
    }
  };

  const handleAdPersonalizationToggle = async (value: boolean) => {
    try {
      setAdPersonalizationEnabled(value);
      
      await updatePreferences({
        ads: {
          ...preferences?.ads,
          personalization: value
        }
      });
      
      trackEvent('settings_ad_personalization_toggled', { enabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update ad personalization settings');
    }
  };

  const handleManageSubscription = () => {
    trackEvent('settings_manage_subscription');
    navigation.navigate('Subscription');
  };

  const handlePrivacyPolicy = () => {
    trackEvent('settings_privacy_policy');
    navigation.navigate('PrivacyPolicy');
  };

  const handleTermsOfService = () => {
    trackEvent('settings_terms_of_service');
    navigation.navigate('TermsOfService');
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out ShortDramaVerse - The best platform for short drama series! Download now and start watching amazing content.',
        url: 'https://shortdramaverse.com', // Replace with actual app store URL
      });
      
      trackEvent('settings_app_shared');
    } catch (error) {
      Alert.alert('Error', 'Failed to share app');
    }
  };

  const handleRateApp = () => {
    trackEvent('settings_rate_app');
    Alert.alert(
      'Rate App',
      'Would you like to rate ShortDramaVerse on the App Store?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rate', onPress: () => {
          // Open app store rating
          // In a real app, use a library like react-native-rate
        }}
      ]
    );
  };

  const handleContactSupport = () => {
    trackEvent('settings_contact_support');
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => {
          // Open email app
          // In a real app, use Linking.openURL('mailto:support@shortdramaverse.com')
        }},
        { text: 'Chat', onPress: () => {
          navigation.navigate('Support');
        }}
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including downloaded episodes and preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear cache logic
              trackEvent('settings_cache_cleared');
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              trackEvent('settings_logout');
              navigation.navigate('Auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Warning',
              'Are you absolutely sure you want to delete your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete Forever', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Delete account logic
                      trackEvent('settings_account_deleted');
                      Alert.alert('Account Deleted', 'Your account has been deleted successfully');
                      navigation.navigate('Auth');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#333', true: '#ff6b6b' }}
              thumbColor={item.value ? '#fff' : '#ccc'}
            />
          </View>
        );
      
      case 'navigation':
      case 'action':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={item.onPress}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            {item.type === 'navigation' && (
              <Text style={styles.chevron}>›</Text>
            )}
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  const playbackSettings: SettingItem[] = [
    {
      id: 'autoplay',
      title: 'Auto-Play Next Episode',
      subtitle: 'Automatically play the next episode',
      type: 'switch',
      value: autoPlayEnabled,
      onValueChange: handleAutoPlayToggle,
    },
    {
      id: 'data_optimization',
      title: 'Data Optimization',
      subtitle: 'Reduce data usage with lower quality streaming',
      type: 'switch',
      value: dataOptimizationEnabled,
      onValueChange: handleDataOptimizationToggle,
    },
  ];

  const notificationSettings: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive notifications for new episodes and updates',
      type: 'switch',
      value: notificationsEnabled,
      onValueChange: handleNotificationsToggle,
    },
  ];

  const privacySettings: SettingItem[] = [
    {
      id: 'ad_personalization',
      title: 'Ad Personalization',
      subtitle: 'Show personalized ads based on your preferences',
      type: 'switch',
      value: adPersonalizationEnabled,
      onValueChange: handleAdPersonalizationToggle,
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy',
      type: 'navigation',
      onPress: handlePrivacyPolicy,
    },
    {
      id: 'terms_of_service',
      title: 'Terms of Service',
      type: 'navigation',
      onPress: handleTermsOfService,
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'manage_subscription',
      title: 'Manage Subscription',
      subtitle: 'View and manage your subscription',
      type: 'navigation',
      onPress: handleManageSubscription,
    },
    {
      id: 'logout',
      title: 'Logout',
      type: 'action',
      onPress: handleLogout,
    },
    {
      id: 'delete_account',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      type: 'action',
      onPress: handleDeleteAccount,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'share_app',
      title: 'Share App',
      subtitle: 'Share ShortDramaVerse with friends',
      type: 'action',
      onPress: handleShareApp,
    },
    {
      id: 'rate_app',
      title: 'Rate App',
      subtitle: 'Rate us on the App Store',
      type: 'action',
      onPress: handleRateApp,
    },
    {
      id: 'contact_support',
      title: 'Contact Support',
      subtitle: 'Get help with your account',
      type: 'action',
      onPress: handleContactSupport,
    },
    {
      id: 'clear_cache',
      title: 'Clear Cache',
      subtitle: 'Free up storage space',
      type: 'action',
      onPress: handleClearCache,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          {playbackSettings.map(renderSettingItem)}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notificationSettings.map(renderSettingItem)}
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          {privacySettings.map(renderSettingItem)}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {accountSettings.map(renderSettingItem)}
        </View>

        {/* Support Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportSettings.map(renderSettingItem)}
        </View>

        {/* App Version */}
        <View style={styles.section}>
          <Text style={styles.versionText}>ShortDramaVerse v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#ccc',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#ccc',
  },
  chevron: {
    fontSize: 20,
    color: '#666',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});