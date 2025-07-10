/**
 * NotificationSettingsScreen - User notification preferences management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../App';
import { getNotificationSettings, updateNotificationSettings } from '../services/notifications';
import { trackUserEngagement } from '../services/analytics';
import { getAnonymousUserId } from '../services/anonymousAuth';

type NotificationSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationSettings'>;

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationSettingsScreenNavigationProp>();
  const [settings, setSettings] = useState({
    pushNotifications: false,
    newContentAlerts: false,
    recommendationAlerts: false,
    systemNotifications: false,
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const anonymousId = await getAnonymousUserId();
        setUserId(anonymousId);
        
        const currentSettings = await getNotificationSettings(anonymousId);
        setSettings(currentSettings);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };
    initializeSettings();
  }, []);

  const handleSettingChange = async (setting: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    try {
      if (userId) {
        await updateNotificationSettings(userId, newSettings);
        await trackUserEngagement(userId, 'notification_setting_changed', {
          setting,
          value,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications on your device
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              trackColor={{ false: '#767577', true: '#ff6b6b' }}
              thumbColor={settings.pushNotifications ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>New Content Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when new episodes are available
              </Text>
            </View>
            <Switch
              value={settings.newContentAlerts}
              onValueChange={(value) => handleSettingChange('newContentAlerts', value)}
              trackColor={{ false: '#767577', true: '#ff6b6b' }}
              thumbColor={settings.newContentAlerts ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Recommendation Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified about personalized recommendations
              </Text>
            </View>
            <Switch
              value={settings.recommendationAlerts}
              onValueChange={(value) => handleSettingChange('recommendationAlerts', value)}
              trackColor={{ false: '#767577', true: '#ff6b6b' }}
              thumbColor={settings.recommendationAlerts ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>System Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive important system updates and announcements
              </Text>
            </View>
            <Switch
              value={settings.systemNotifications}
              onValueChange={(value) => handleSettingChange('systemNotifications', value)}
              trackColor={{ false: '#767577', true: '#ff6b6b' }}
              thumbColor={settings.systemNotifications ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 18,
  },
});

export default NotificationSettingsScreen;