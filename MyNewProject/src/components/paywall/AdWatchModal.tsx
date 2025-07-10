/**
 * Ad Watch Modal Component
 * 
 * Modal for watching advertisements to unlock content
 * without requiring a subscription or coin purchase.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advertisingService, AdStatus, AdType } from '@/services/advertising';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEventType } from '@/services/analytics';

interface AdWatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  contentId: number;
  contentType: 'episode' | 'series' | 'movie';
  contentTitle: string;
  onAdCompleted: () => void;
  thumbnailUrl?: string;
}

const AdWatchModal: React.FC<AdWatchModalProps> = ({
  isVisible,
  onClose,
  contentId,
  contentType,
  contentTitle,
  onAdCompleted,
  thumbnailUrl
}) => {
  const [adStatus, setAdStatus] = useState<AdStatus>(AdStatus.NOT_AVAILABLE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [adProgress, setAdProgress] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  // Load ad when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      loadAd();
    }
  }, [isVisible]);
  
  // Add ad event listener when component mounts
  useEffect(() => {
    // Add ad event listener
    advertisingService.addListener(AdType.REWARDED, handleAdStatusChange);
    
    // Remove listener when component unmounts
    return () => {
      advertisingService.removeListener(AdType.REWARDED, handleAdStatusChange);
    };
  }, []);
  
  // Countdown timer for ad
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isAdPlaying && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown(prev => prev - 1);
        setAdProgress(prev => prev + (1 / 30)); // Assuming 30-second ad
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAdPlaying, countdown]);
  
  // Handler for ad status changes
  const handleAdStatusChange = (status: AdStatus, data?: any) => {
    setAdStatus(status);
    
    switch (status) {
      case AdStatus.LOADING:
        setIsLoading(true);
        break;
        
      case AdStatus.READY:
        setIsLoading(false);
        break;
        
      case AdStatus.SHOWING:
        setIsAdPlaying(true);
        setCountdown(30); // Assuming 30-second ad
        break;
        
      case AdStatus.COMPLETED:
        setIsAdPlaying(false);
        setIsLoading(false);
        handleAdCompletion();
        break;
        
      case AdStatus.FAILED:
        setIsAdPlaying(false);
        setIsLoading(false);
        Alert.alert(
          'Ad Failed',
          'Failed to load advertisement. Please try again.',
          [{ text: 'OK' }]
        );
        break;
        
      case AdStatus.SKIPPED:
        setIsAdPlaying(false);
        setIsLoading(false);
        Alert.alert(
          'Ad Skipped',
          'You need to watch the full ad to unlock the content.',
          [{ text: 'OK' }]
        );
        break;
    }
  };
  
  // Load ad
  const loadAd = async () => {
    setIsLoading(true);
    setAdStatus(AdStatus.LOADING);
    
    try {
      const adLoaded = await advertisingService.loadAd(AdType.REWARDED);
      
      if (!adLoaded) {
        setAdStatus(AdStatus.NOT_AVAILABLE);
        setIsLoading(false);
        Alert.alert(
          'No Ads Available',
          'Sorry, there are no ads available at the moment. Please try again later or consider other options.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading ad:', error);
      setIsLoading(false);
      setAdStatus(AdStatus.FAILED);
      Alert.alert(
        'Error',
        'Failed to load advertisement. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Show ad
  const showAd = async () => {
    try {
      await advertisingService.showAd(AdType.REWARDED, {
        contentId,
        contentType,
        minInterval: 0 // Override minimum interval for this specific case
      });
    } catch (error) {
      console.error('Error showing ad:', error);
      Alert.alert(
        'Error',
        'Failed to show advertisement. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle successful ad completion
  const handleAdCompletion = () => {
    // Track in analytics
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'ad_completed',
      contentId,
      contentType,
      contentTitle
    });
    
    // Show success message
    setShowSuccess(true);
    
    // After short delay, close and notify parent
    setTimeout(() => {
      setShowSuccess(false);
      onAdCompleted();
      onClose();
    }, 2000);
  };
  
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {!isAdPlaying && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              disabled={isAdPlaying}
            >
              <Ionicons name="ios-close" size={24} color="#000" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.modalTitle}>
            {showSuccess ? 'Content Unlocked!' : 'Watch Ad to Unlock'}
          </Text>
          
          <View style={styles.contentInfo}>
            {thumbnailUrl && (
              <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
            )}
            <View style={styles.contentDetails}>
              <Text style={styles.contentType}>
                {contentType === 'episode' ? 'Episode' : contentType === 'series' ? 'Series' : 'Movie'}
              </Text>
              <Text style={styles.contentTitle} numberOfLines={2}>
                {contentTitle}
              </Text>
            </View>
          </View>
          
          {showSuccess ? (
            <View style={styles.successContainer}>
              <Ionicons name="ios-checkmark-circle" size={60} color="#4CAF50" />
              <Text style={styles.successText}>Content Unlocked!</Text>
              <Text style={styles.successSubtext}>Thank you for watching the ad.</Text>
            </View>
          ) : isAdPlaying ? (
            <View style={styles.adPlayingContainer}>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${adProgress * 100}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.countdownText}>
                {countdown > 0 ? `Ad will end in ${countdown} seconds` : 'Ad ending...'}
              </Text>
              
              <View style={styles.adContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.adPlayingText}>Advertisement Playing</Text>
                <Text style={styles.adInstructionText}>
                  Please watch the entire ad to unlock content.
                </Text>
              </View>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading advertisement...</Text>
            </View>
          ) : (
            <View style={styles.adInfoContainer}>
              <Ionicons name="ios-videocam" size={50} color="#0000ff" />
              
              <Text style={styles.adInfoText}>
                Watch a short advertisement to unlock this content for free.
              </Text>
              
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Ionicons name="ios-checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>No subscription required</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="ios-checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>No coins needed</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="ios-checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>Quick and easy process</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.watchButton}
                onPress={showAd}
                disabled={adStatus !== AdStatus.READY || isLoading}
              >
                <Text style={styles.watchButtonText}>
                  Watch Ad to Unlock
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.termsText}>
                By watching ads, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  contentInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  contentDetails: {
    flex: 1,
  },
  contentType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  adInfoContainer: {
    alignItems: 'center',
    padding: 10,
  },
  adInfoText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    marginVertical: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  watchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 15,
  },
  watchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  adPlayingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  countdownText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    minHeight: 200,
  },
  adPlayingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  adInstructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  successSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default AdWatchModal;