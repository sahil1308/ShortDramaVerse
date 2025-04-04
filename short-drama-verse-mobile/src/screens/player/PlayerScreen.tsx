/**
 * Video Player Screen
 * 
 * Handles video playback, controls, and progress tracking for episodes.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Episode } from '@/types/drama';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { colors, spacing } from '@/constants/theme';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

/**
 * Video Player Screen Component
 * 
 * @returns Player screen JSX
 */
const PlayerScreen = () => {
  // Refs
  const videoRef = useRef<Video>(null);
  
  // Navigation
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get episode ID and series ID from route params
  const { episodeId, seriesId, episode: initialEpisode } = route.params as {
    episodeId: number;
    seriesId: number;
    episode?: Episode;
  };
  
  // Auth and Analytics
  const { user } = useAuth();
  const { trackScreenView, trackVideoStart, trackVideoProgress, trackVideoComplete } = useAnalytics();
  
  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  
  // Timer for hiding controls
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Last progress tracking time
  const lastProgressTrackRef = useRef(0);
  
  // Fetch episode data
  const { data: episode, isLoading: loadingEpisode } = useQuery({
    queryKey: ['episode', episodeId],
    queryFn: () => api.get<Episode>(`/series/${seriesId}/episodes/${episodeId}`),
    // Use initial episode data if available
    initialData: initialEpisode,
  });
  
  // Track watch history
  const watchHistoryMutation = useMutation({
    mutationFn: (data: { episodeId: number; seriesId: number; progress: number; completed: boolean }) => {
      return api.post('/user/watch-history', data);
    },
  });
  
  // Effects
  
  // Track screen view when component mounts
  useEffect(() => {
    trackScreenView('Player', { episode_id: episodeId, series_id: seriesId });
  }, [episodeId, seriesId, trackScreenView]);
  
  // Track video start when video loads
  useEffect(() => {
    if (episode && !isBuffering) {
      trackVideoStart(episodeId, seriesId, { title: episode.title });
    }
  }, [episode, isBuffering, episodeId, seriesId, trackVideoStart]);
  
  // Update controls visibility timer
  useEffect(() => {
    if (showControls) {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
      
      controlsTimer.current = setTimeout(() => {
        if (isPlaying && !isSeeking) {
          setShowControls(false);
        }
      }, 3000);
    }
    
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, [showControls, isPlaying, isSeeking]);
  
  // Track progress and completion
  const trackProgress = (progress: number, position: number) => {
    // Only track progress every 10 seconds
    const now = Date.now();
    if (now - lastProgressTrackRef.current > 10000) {
      lastProgressTrackRef.current = now;
      trackVideoProgress(episodeId, seriesId, progress, position);
      
      // Update watch history if user is logged in
      if (user) {
        watchHistoryMutation.mutate({
          episodeId,
          seriesId,
          progress,
          completed: progress >= 0.9, // Mark as completed if 90% watched
        });
      }
    }
  };
  
  // Handle video load
  const handleLoad = (data: { duration: number }) => {
    setDuration(data.duration);
    setIsBuffering(false);
  };
  
  // Handle video progress
  const handleProgress = (data: { currentTime: number }) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
      
      const progress = duration > 0 ? data.currentTime / duration : 0;
      trackProgress(progress, data.currentTime);
      
      // Track completion if 95% watched
      if (progress >= 0.95 && !isBuffering) {
        trackVideoComplete(episodeId, seriesId);
      }
    }
  };
  
  // Handle video end
  const handleEnd = () => {
    setIsPlaying(false);
    trackVideoComplete(episodeId, seriesId);
    
    // Update watch history as completed
    if (user) {
      watchHistoryMutation.mutate({
        episodeId,
        seriesId,
        progress: 1,
        completed: true,
      });
    }
  };
  
  // Handle video error
  const handleError = (err: { error: { code: string; localizedDescription: string } }) => {
    const errorMessage = err.error.localizedDescription || 'An error occurred while playing the video';
    setError(errorMessage);
    setIsBuffering(false);
  };
  
  // Toggle play state
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Seek to a specific time
  const seekTo = (time: number) => {
    videoRef.current?.seek(time);
    setCurrentTime(time);
  };
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  
  // Go back
  const goBack = () => {
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={isFullscreen} />
      
      <View style={styles.videoContainer}>
        {/* Video Player */}
        {episode ? (
          <Video
            ref={videoRef}
            source={{ uri: episode.videoUrl }}
            style={styles.video}
            resizeMode="contain"
            paused={!isPlaying}
            onLoad={handleLoad}
            onProgress={handleProgress}
            onEnd={handleEnd}
            onError={handleError}
            onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
            repeat={false}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        
        {/* Video Controls - shown when showControls is true */}
        {showControls && (
          <TouchableOpacity
            style={styles.controlsOverlay}
            activeOpacity={1}
            onPress={toggleControls}
          >
            <View style={styles.controlsContainer}>
              {/* Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                
                <Text style={styles.episodeTitle} numberOfLines={1}>
                  {episode?.title || 'Loading...'}
                </Text>
                
                <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
                  <Text style={styles.fullscreenButtonText}>
                    {isFullscreen ? 'Exit' : 'Full'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Center Play/Pause Button */}
              <TouchableOpacity onPress={togglePlay} style={styles.playPauseButton}>
                <Text style={styles.playPauseButtonText}>
                  {isPlaying ? 'II' : '▶️'}
                </Text>
              </TouchableOpacity>
              
              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                {/* Current Time */}
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground} />
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${(currentTime / duration) * 100}%` },
                    ]}
                  />
                </View>
                
                {/* Duration */}
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Loading Indicator */}
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.bufferingText}>Buffering...</Text>
          </View>
        )}
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity onPress={goBack} style={styles.errorBackButton}>
              <Text style={styles.errorBackButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
  },
  episodeTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  fullscreenButton: {
    padding: spacing.sm,
  },
  fullscreenButtonText: {
    color: colors.white,
    fontSize: 16,
  },
  playPauseButton: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonText: {
    color: colors.white,
    fontSize: 24,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : spacing.lg,
  },
  timeText: {
    color: colors.white,
    fontSize: 12,
    minWidth: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bufferingText: {
    color: colors.white,
    marginTop: spacing.sm,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorBackButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  errorBackButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PlayerScreen;