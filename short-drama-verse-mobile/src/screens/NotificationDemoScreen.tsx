/**
 * Notification Demo Screen
 * 
 * A demo screen to showcase and test different types of notifications
 * with rich content banners on both iOS and Android.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType, NotificationData } from '@/services/notifications';
import { useTheme } from '@/hooks/useTheme';

// Sample banner images
const SAMPLE_IMAGES = [
  'https://example.com/notification1.jpg',
  'https://example.com/notification2.jpg',
  'https://example.com/notification3.jpg',
  'https://picsum.photos/800/400', // Fallback to random image service if others don't work
];

const NotificationDemoScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation();
  
  // Theme
  const { isDarkMode } = useTheme();
  
  // Get notifications hook
  const { hasPermission, isLoading, requestPermission, scheduleNotification } = useNotifications();
  
  // Form state
  const [title, setTitle] = useState<string>('New Episode Available');
  const [body, setBody] = useState<string>('Season 2, Episode 5 of "Drama Queens" is now ready to watch!');
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_IMAGES[0]);
  const [selectedType, setSelectedType] = useState<NotificationType>(NotificationType.NEW_EPISODE);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [addActions, setAddActions] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  
  // Send notification
  const sendNotification = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'To send notifications, you need to grant permission first.',
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
    
    setSending(true);
    
    try {
      const notificationData: NotificationData = {
        type: selectedType,
        title,
        body,
        imageUrl: showBanner ? imageUrl : undefined,
      };
      
      // Add deep link based on type
      switch (selectedType) {
        case NotificationType.NEW_EPISODE:
          notificationData.deepLink = 'shortdramaverse://episode/123';
          break;
        case NotificationType.SERIES_UPDATE:
          notificationData.deepLink = 'shortdramaverse://series/456';
          break;
        case NotificationType.CONTENT_RECOMMENDATION:
          notificationData.deepLink = 'shortdramaverse://series/789';
          break;
        case NotificationType.SPECIAL_OFFER:
          notificationData.deepLink = 'shortdramaverse://offers';
          break;
        default:
          break;
      }
      
      // Add actions if enabled
      if (addActions) {
        switch (selectedType) {
          case NotificationType.NEW_EPISODE:
          case NotificationType.SERIES_UPDATE:
            notificationData.actions = [
              {
                id: 'watch',
                title: 'Watch Now',
                navigateTo: 'EpisodePlayer',
                params: { episodeId: 123 },
              },
              {
                id: 'later',
                title: 'Remind Later',
              },
            ];
            break;
          case NotificationType.CONTENT_RECOMMENDATION:
            notificationData.actions = [
              {
                id: 'view',
                title: 'View Series',
                navigateTo: 'SeriesDetail',
                params: { seriesId: 789 },
              },
              {
                id: 'add',
                title: 'Add to Watchlist',
              },
            ];
            break;
          case NotificationType.SPECIAL_OFFER:
            notificationData.actions = [
              {
                id: 'redeem',
                title: 'Redeem Offer',
                navigateTo: 'OffersScreen',
              },
            ];
            break;
          default:
            break;
        }
      }
      
      const notificationId = await scheduleNotification(notificationData);
      
      if (notificationId) {
        Alert.alert(
          'Notification Sent',
          'The notification has been sent successfully.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to send notification. Please check your settings and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert(
        'Error',
        'An error occurred while trying to send the notification.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };
  
  // Change notification type
  const changeNotificationType = (type: NotificationType) => {
    setSelectedType(type);
    
    // Update defaults based on type
    switch (type) {
      case NotificationType.NEW_EPISODE:
        setTitle('New Episode Available');
        setBody('Season 2, Episode 5 of "Drama Queens" is now ready to watch!');
        break;
      case NotificationType.SERIES_UPDATE:
        setTitle('Series Update');
        setBody('"Tokyo Tales" has been renewed for a new season!');
        break;
      case NotificationType.CONTENT_RECOMMENDATION:
        setTitle('Recommended for You');
        setBody('Based on your watch history, you might like "Midnight Chronicles"');
        break;
      case NotificationType.SPECIAL_OFFER:
        setTitle('Special Offer');
        setBody('Get 50% off premium subscription for the next 24 hours!');
        break;
      case NotificationType.WATCHLIST_REMINDER:
        setTitle('Watchlist Reminder');
        setBody('"Starlight Boulevard" has been in your watchlist for 7 days. Watch it now!');
        break;
      case NotificationType.ACCOUNT_UPDATE:
        setTitle('Account Update');
        setBody('Your payment method has been updated successfully.');
        break;
      default:
        break;
    }
  };
  
  // Switch to next image
  const nextImage = () => {
    const currentIndex = SAMPLE_IMAGES.indexOf(imageUrl);
    const nextIndex = (currentIndex + 1) % SAMPLE_IMAGES.length;
    setImageUrl(SAMPLE_IMAGES[nextIndex]);
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff5e3a" />
          <Text style={[styles.loadingText, isDarkMode && styles.textLight]}>
            Loading notification settings...
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
          Notification Demo
        </Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <MaterialIcons name="settings" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Permission warning */}
        {!hasPermission && (
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
        
        {/* Notification type selector */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
            Notification Type
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {Object.values(NotificationType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && styles.typeButtonSelected,
                ]}
                onPress={() => changeNotificationType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Notification content */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
            Notification Content
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.textLight]}>Title</Text>
            <TextInput
              style={[
                styles.input,
                isDarkMode && styles.inputDark,
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter notification title"
              placeholderTextColor={isDarkMode ? '#777' : '#999'}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.textLight]}>Body</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                isDarkMode && styles.inputDark,
              ]}
              value={body}
              onChangeText={setBody}
              placeholder="Enter notification body text"
              placeholderTextColor={isDarkMode ? '#777' : '#999'}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, isDarkMode && styles.textLight]}>
              Show Banner Image
            </Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                showBanner && styles.toggleActive,
              ]}
              onPress={() => setShowBanner(!showBanner)}
            >
              <View
                style={[
                  styles.toggleDot,
                  showBanner && styles.toggleDotActive,
                ]}
              />
            </TouchableOpacity>
          </View>
          
          {showBanner && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={nextImage}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, isDarkMode && styles.textLight]}>
              Add Action Buttons
            </Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                addActions && styles.toggleActive,
              ]}
              onPress={() => setAddActions(!addActions)}
            >
              <View
                style={[
                  styles.toggleDot,
                  addActions && styles.toggleDotActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Preview and send */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, isDarkMode && styles.textLight]}>
              How it will appear
            </Text>
            <Text style={[styles.previewPlatform, isDarkMode && styles.textLightSecondary]}>
              {Platform.OS === 'ios' ? 'iOS' : 'Android'} Style
            </Text>
          </View>
          
          <View style={styles.notificationPreview}>
            <View style={styles.previewContent}>
              <View style={styles.previewIconContainer}>
                <Image
                  source={require('@/assets/images/app-icon.png')}
                  style={styles.previewIcon}
                />
              </View>
              <View style={styles.previewTextContainer}>
                <Text style={styles.previewAppName}>ShortDramaVerse</Text>
                <Text style={styles.previewTitle}>{title || 'Notification Title'}</Text>
                <Text 
                  style={styles.previewBody} 
                  numberOfLines={2}
                >
                  {body || 'Notification body text will appear here'}
                </Text>
              </View>
              <Text style={styles.previewTime}>now</Text>
            </View>
            
            {showBanner && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.previewBanner}
                resizeMode="cover"
              />
            )}
            
            {addActions && (
              <View style={styles.previewActions}>
                {selectedType === NotificationType.NEW_EPISODE && (
                  <>
                    <TouchableOpacity style={styles.previewAction}>
                      <Text style={styles.previewActionText}>Watch Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.previewAction}>
                      <Text style={styles.previewActionText}>Remind Later</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {selectedType === NotificationType.CONTENT_RECOMMENDATION && (
                  <>
                    <TouchableOpacity style={styles.previewAction}>
                      <Text style={styles.previewActionText}>View Series</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.previewAction}>
                      <Text style={styles.previewActionText}>Add to Watchlist</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {selectedType === NotificationType.SPECIAL_OFFER && (
                  <TouchableOpacity style={styles.previewAction}>
                    <Text style={styles.previewActionText}>Redeem Offer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (sending || !hasPermission) && styles.sendButtonDisabled,
            ]}
            onPress={sendNotification}
            disabled={sending || !hasPermission}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>
                Send Notification
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.sendDescription, isDarkMode && styles.textLightSecondary]}>
            {Platform.OS === 'ios' 
              ? 'On iOS, rich notifications with images work best when the app is in the background.'
              : 'On Android, rich notifications with images should work in all app states.'}
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
  settingsButton: {
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
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 12,
    margin: 16,
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
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: '#f0f0f0',
  },
  typeButtonSelected: {
    backgroundColor: '#ff5e3a',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#ff5e3a',
  },
  toggleDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  imagePreviewContainer: {
    padding: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  previewPlatform: {
    fontSize: 14,
    color: '#666',
  },
  notificationPreview: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? '#f9f9f9' : '#fff',
  },
  previewContent: {
    flexDirection: 'row',
    padding: 12,
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Platform.OS === 'ios' ? 10 : 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  previewIcon: {
    width: '100%',
    height: '100%',
  },
  previewTextContainer: {
    flex: 1,
  },
  previewAppName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  previewTime: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  previewBody: {
    fontSize: 14,
    color: '#666',
  },
  previewBanner: {
    width: '100%',
    height: 150,
  },
  previewActions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  previewAction: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Platform.OS === 'ios' ? '#e0e0e0' : '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
  },
  previewActionText: {
    fontSize: 14,
    color: Platform.OS === 'ios' ? '#007aff' : '#ff5e3a',
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#ff5e3a',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendDescription: {
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

export default NotificationDemoScreen;