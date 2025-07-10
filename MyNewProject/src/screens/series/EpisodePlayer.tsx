import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Episode, WatchHistory } from '@/types/drama';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingScreen from '@/screens/common/LoadingScreen';
import * as ScreenOrientation from 'expo-screen-orientation';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Colors
const colors = {
  primary: '#E50914',
  background: '#121212',
  cardBg: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  inactive: '#555555',
  success: '#4CAF50',
};

type EpisodePlayerRouteProp = RouteProp<RootStackParamList, 'EpisodePlayer'>;
type EpisodePlayerNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EpisodePlayer = () => {
  const route = useRoute<EpisodePlayerRouteProp>();
  const navigation = useNavigation<EpisodePlayerNavigationProp>();
  const { episodeId, seriesId } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<Video>(null);
  
  // Player state
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPremiumContent, setIsPremiumContent] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [watchHistoryId, setWatchHistoryId] = useState<number | null>(null);
  
  // Auto-hide controls timer
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get episode details
  const {
    data: episode,
    isLoading: isEpisodeLoading,
    error: episodeError,
  } = useQuery({
    queryKey: ['episodes', episodeId],
    queryFn: () => api.get<Episode>(`${endpoints.episodes.get(episodeId)}`),
  });
  
  // Get watch history for this episode
  const {
    data: watchHistory,
    isLoading: isWatchHistoryLoading,
  } = useQuery({
    queryKey: ['watchHistory', episodeId],
    queryFn: () => api.get<WatchHistory | null>(`${endpoints.watchHistory.getByEpisode(episodeId)}`),
    enabled: !!user && !!episodeId,
  });
  
  // Create watch history mutation
  const createWatchHistoryMutation = useMutation({
    mutationFn: (data: { episodeId: number; progressSeconds: number; completed: boolean }) =>
      api.post<WatchHistory>(endpoints.watchHistory.create, data),
    onSuccess: (data) => {
      setWatchHistoryId(data.id);
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
    },
    onError: (error) => {
      console.error('Error creating watch history:', error);
    },
  });
  
  // Update watch history mutation
  const updateWatchHistoryMutation = useMutation({
    mutationFn: (data: { id: number; progressSeconds: number; completed: boolean }) =>
      api.put<WatchHistory>(`${endpoints.watchHistory.update(data.id)}`, {
        progressSeconds: data.progressSeconds,
        completed: data.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
    },
    onError: (error) => {
      console.error('Error updating watch history:', error);
    },
  });
  
  // Handle purchase premium content mutation
  const purchaseContentMutation = useMutation({
    mutationFn: () => api.post(`${endpoints.transactions.purchase(episodeId)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes', episodeId] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsPremiumContent(false);
    },
    onError: (error) => {
      console.error('Error purchasing content:', error);
      Alert.alert(
        'Purchase Failed',
        'Could not complete the purchase. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    },
  });
  
  // Reset controls timer
  const resetControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    controlsTimerRef.current = setTimeout(() => {
      if (status?.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (status?.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    
    resetControlsTimer();
  };
  
  // Handle seek
  const handleSeek = async (value: number) => {
    if (!videoRef.current || !duration) return;
    
    const newPosition = value * duration;
    await videoRef.current.setPositionAsync(newPosition * 1000);
    setProgress(value);
    setPosition(newPosition);
    
    resetControlsTimer();
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
    
    resetControlsTimer();
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Update watch history
  const updateWatchHistory = (positionMs: number, durationMs: number) => {
    if (!user || !episodeId) return;
    
    const progressSeconds = Math.floor(positionMs / 1000);
    const completed = positionMs >= durationMs * 0.9; // Mark as completed if watched 90% or more
    
    if (watchHistoryId) {
      updateWatchHistoryMutation.mutate({
        id: watchHistoryId,
        progressSeconds,
        completed,
      });
    } else {
      createWatchHistoryMutation.mutate({
        episodeId,
        progressSeconds,
        completed,
      });
    }
  };
  
  // Handle playback status update
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    
    if (status.isLoaded) {
      const newPosition = status.positionMillis / 1000;
      const newDuration = status.durationMillis ? status.durationMillis / 1000 : 0;
      
      setPosition(newPosition);
      setDuration(newDuration);
      setProgress(newDuration > 0 ? newPosition / newDuration : 0);
      
      // Update watch history every 10 seconds
      if (
        status.positionMillis % 10000 < 1000 &&
        status.positionMillis > 0 &&
        status.durationMillis
      ) {
        updateWatchHistory(status.positionMillis, status.durationMillis);
      }
    }
  };
  
  // Handle purchase premium content
  const handlePurchaseContent = () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    
    if (!episode) return;
    
    Alert.alert(
      'Purchase Premium Content',
      `This episode costs ${episode.coinPrice} coins. Would you like to purchase it?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Purchase',
          onPress: () => purchaseContentMutation.mutate(),
        },
      ]
    );
  };
  
  // Check if this is premium content
  useEffect(() => {
    if (episode) {
      setIsPremiumContent(!episode.isFree && !episode.purchased);
    }
  }, [episode]);
  
  // Initialize watch history
  useEffect(() => {
    if (watchHistory) {
      setWatchHistoryId(watchHistory.id);
      
      // Resume from last position
      if (videoRef.current && watchHistory.progressSeconds > 0) {
        videoRef.current.setPositionAsync(watchHistory.progressSeconds * 1000);
      }
    }
  }, [watchHistory]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      // Reset screen orientation
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);
  
  // Loading state
  if (isEpisodeLoading || isWatchHistoryLoading) {
    return <LoadingScreen message="Loading episode..." />;
  }
  
  // Error state
  if (episodeError || !episode) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading episode.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar hidden={isFullscreen} />
      
      {/* Video Player */}
      <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideoContainer]}>
        <TouchableOpacity
          style={styles.videoTouchable}
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: episode.videoUrl }}
            useNativeControls={false}
            resizeMode={isFullscreen ? ResizeMode.CONTAIN : ResizeMode.COVER}
            shouldPlay={!isPremiumContent}
            progressUpdateIntervalMillis={1000}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
          
          {isPremiumContent && (
            <View style={styles.premiumOverlay}>
              <View style={styles.premiumContent}>
                <MaterialIcons name="lock" size={40} color={colors.text} />
                <Text style={styles.premiumTitle}>Premium Content</Text>
                <Text style={styles.premiumMessage}>
                  This episode requires {episode.coinPrice} coins to unlock.
                </Text>
                <TouchableOpacity
                  style={styles.purchaseButton}
                  onPress={handlePurchaseContent}
                >
                  <Text style={styles.purchaseButtonText}>Unlock Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Video Controls */}
          {showControls && !isPremiumContent && (
            <View style={styles.controlsContainer}>
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent']}
                style={styles.controlsGradientTop}
              />
              
              {/* Top Bar */}
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.episodeTitle} numberOfLines={1}>
                  {episode.title}
                </Text>
                <View style={{ width: 24 }} />
              </View>
              
              {/* Center Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={async () => {
                    if (videoRef.current && position > 10) {
                      await videoRef.current.setPositionAsync((position - 10) * 1000);
                    }
                  }}
                >
                  <Ionicons name="play-back" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  <Ionicons
                    name={status?.isPlaying ? 'pause' : 'play'}
                    size={32}
                    color={colors.text}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={async () => {
                    if (videoRef.current && duration > 0) {
                      const newPosition = Math.min(position + 10, duration);
                      await videoRef.current.setPositionAsync(newPosition * 1000);
                    }
                  }}
                >
                  <Ionicons name="play-forward" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.controlsGradientBottom}
              />
              
              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground} />
                  <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                  <TouchableOpacity
                    style={[
                      styles.progressThumb,
                      { left: `${Math.max(0, Math.min(progress * 100, 100))}%` },
                    ]}
                    onPress={(e) => {
                      const { locationX } = e.nativeEvent;
                      const progressBarWidth = width - 120; // Adjust based on your layout
                      const newProgress = Math.max(
                        0,
                        Math.min(locationX / progressBarWidth, 1)
                      );
                      handleSeek(newProgress);
                    }}
                  />
                </View>
                
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                
                <TouchableOpacity
                  style={styles.fullscreenButton}
                  onPress={toggleFullscreen}
                >
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Episode Info */}
      {!isFullscreen && (
        <ScrollView style={styles.infoContainer}>
          <View style={styles.episodeInfo}>
            <Text style={styles.episodeTitleLarge}>{episode.title}</Text>
            <Text style={styles.episodeSubtitle}>
              Episode {episode.episodeNumber} • {episode.duration} min
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  Released {new Date(episode.releaseDate).toLocaleDateString()}
                </Text>
              </View>
              {episode.viewCount > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{episode.viewCount} views</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.episodeDescription}>{episode.description}</Text>
            
            {/* Next Episode Button */}
            <TouchableOpacity style={styles.nextEpisodeButton}>
              <Text style={styles.nextEpisodeText}>Next Episode</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </TouchableOpacity>
            
            {/* Episode Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={20} color={colors.text} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={20} color={colors.text} />
                <Text style={styles.actionText}>Download</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('SeriesDetails', { seriesId })}
              >
                <Ionicons name="list-outline" size={20} color={colors.text} />
                <Text style={styles.actionText}>All Episodes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullscreenContainer: {
    backgroundColor: '#000',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  fullscreenVideoContainer: {
    width: '100%',
    height: '100%',
    aspectRatio: undefined,
  },
  videoTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  premiumTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  premiumMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  purchaseButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  controlsGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  controlsGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  episodeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  timeText: {
    color: colors.text,
    fontSize: 12,
    width: 45,
    textAlign: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    left: 0,
    top: 8,
    borderRadius: 2,
  },
  progressThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 3,
    marginLeft: -7,
  },
  fullscreenButton: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  episodeInfo: {
    padding: 16,
  },
  episodeTitleLarge: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  episodeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 5,
  },
  episodeDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  nextEpisodeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  nextEpisodeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 15,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
});

export default EpisodePlayer;