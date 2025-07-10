/**
 * VideoPlayerScreen - Full-screen video player for drama episodes
 * 
 * This screen provides an immersive video watching experience with features like:
 * - Full-screen video playback
 * - Episode navigation
 * - Monetization options (ads, coins, subscription)
 * - User engagement tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  BackHandler,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../../App';

// Import services
import { getDramaEpisode } from '../services/content';
import { checkEpisodeAccess } from '../services/access';
import { trackUserEngagement } from '../services/analytics';
import { getAnonymousUserId } from '../services/anonymousAuth';

type VideoPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoPlayer'>;
type VideoPlayerScreenRouteProp = RouteProp<RootStackParamList, 'VideoPlayer'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * VideoPlayerScreen Component
 * 
 * Full-screen video player with monetization and engagement tracking
 */
const VideoPlayerScreen: React.FC = () => {
  const navigation = useNavigation<VideoPlayerScreenNavigationProp>();
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const { dramaId, episodeId } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get anonymous user ID
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const anonymousId = await getAnonymousUserId();
        setUserId(anonymousId);
      } catch (error) {
        console.error('Failed to get anonymous user ID:', error);
      }
    };
    initializeUser();
  }, []);

  // Fetch episode data
  const { data: episode, isLoading: isEpisodeLoading } = useQuery({
    queryKey: ['episode', dramaId, episodeId],
    queryFn: () => getDramaEpisode(dramaId, episodeId),
  });

  // Check episode access
  useEffect(() => {
    const checkAccess = async () => {
      if (!userId || !episode) return;
      
      try {
        const access = await checkEpisodeAccess(userId, dramaId, episodeId);
        setHasAccess(access.hasAccess);
        
        if (!access.hasAccess) {
          // Show monetization options
          Alert.alert(
            'Premium Content',
            'This episode requires coins or subscription to watch.',
            [
              { text: 'Watch Ad', onPress: handleWatchAd },
              { text: 'Use Coins', onPress: handleUseCoin },
              { text: 'Subscribe', onPress: handleSubscribe },
              { text: 'Cancel', onPress: handleGoBack, style: 'cancel' },
            ]
          );
        }
      } catch (error) {
        console.error('Failed to check episode access:', error);
      }
    };
    
    checkAccess();
  }, [userId, episode, dramaId, episodeId]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Track viewing progress
  useEffect(() => {
    if (isPlaying && userId && currentTime > 0) {
      const trackProgress = async () => {
        try {
          await trackUserEngagement(userId, 'video_progress', {
            dramaId,
            episodeId,
            currentTime,
            duration,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to track video progress:', error);
        }
      };
      
      // Track progress every 30 seconds
      const progressInterval = setInterval(trackProgress, 30000);
      return () => clearInterval(progressInterval);
    }
  }, [isPlaying, userId, currentTime, duration, dramaId, episodeId]);

  // Handle monetization options
  const handleWatchAd = async () => {
    try {
      // Simulate ad watching
      Alert.alert('Ad', 'Ad would play here. Granting access for this demo.');
      setHasAccess(true);
      
      if (userId) {
        await trackUserEngagement(userId, 'ad_watched', {
          dramaId,
          episodeId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to handle ad watching:', error);
    }
  };

  const handleUseCoin = async () => {
    try {
      // Simulate coin usage
      Alert.alert('Coins', 'Coin usage would be handled here. Granting access for this demo.');
      setHasAccess(true);
      
      if (userId) {
        await trackUserEngagement(userId, 'coin_used', {
          dramaId,
          episodeId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to handle coin usage:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      // Simulate subscription
      Alert.alert('Subscription', 'Subscription would be handled here. Granting access for this demo.');
      setHasAccess(true);
      
      if (userId) {
        await trackUserEngagement(userId, 'subscription_prompted', {
          dramaId,
          episodeId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to handle subscription:', error);
    }
  };

  // Handle playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleScreenTouch = () => {
    setShowControls(!showControls);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (isEpisodeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading episode...</Text>
      </View>
    );
  }

  // Show error state if episode not found
  if (!episode) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Episode not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player Area */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleScreenTouch}
        activeOpacity={1}
      >
        {/* Simulated video player */}
        <View style={styles.videoPlayer}>
          <Text style={styles.videoTitle}>{episode.title}</Text>
          <Text style={styles.videoSubtitle}>
            {hasAccess ? 'Video would play here' : 'Access required'}
          </Text>
          
          {/* Play/Pause Button */}
          {hasAccess && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={handleGoBack}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle}>{episode.title}</Text>
              <Text style={styles.episodeDescription}>{episode.description}</Text>
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                  ]}
                />
              </View>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>
            
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePlayPause}
              >
                <Text style={styles.controlButtonText}>
                  {isPlaying ? '⏸️' : '▶️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  videoSubtitle: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 40,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backIconButton: {
    marginRight: 16,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  episodeDescription: {
    color: '#cccccc',
    fontSize: 14,
  },
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 24,
  },
});

export default VideoPlayerScreen;