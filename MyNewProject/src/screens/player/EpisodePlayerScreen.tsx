import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useContent } from '../../hooks/useContent';
import { Drama, Episode } from '../../types/drama';
import { UserPreferences } from '../../types/preferences';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { coinService } from '../../services/coin';
import { subscriptionService } from '../../services/subscription';
import { adService } from '../../services/advertising';

interface EpisodePlayerScreenProps {
  navigation: any;
  route: {
    params: {
      drama: Drama;
      episode: Episode;
      episodes: Episode[];
    };
  };
}

export const EpisodePlayerScreen: React.FC<EpisodePlayerScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { drama, episode, episodes } = route.params;
  const { trackEvent } = useAnalytics();
  const { addToWatchHistory } = useContent();
  const { preferences } = useUserPreferences();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode.duration || 0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [canPlay, setCanPlay] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchTimeRef = useRef(0);

  useEffect(() => {
    checkPlaybackAccess();
    setupBackHandler();
    trackPlaybackStart();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      trackPlaybackEnd();
    };
  }, []);

  const setupBackHandler = () => {
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  };

  const checkPlaybackAccess = async () => {
    try {
      setLoading(true);
      
      // Check if episode is free
      if (episode.isFree) {
        setCanPlay(true);
        setLoading(false);
        return;
      }

      // Check subscription status
      const hasSubscription = await subscriptionService.hasActiveSubscription();
      if (hasSubscription) {
        setCanPlay(true);
        setLoading(false);
        return;
      }

      // Check if user has enough coins
      const userCoins = await coinService.getUserCoins();
      const episodeCost = episode.coinCost || 5;
      
      if (userCoins >= episodeCost) {
        // Show coin payment option
        Alert.alert(
          'Premium Episode',
          `This episode costs ${episodeCost} coins. Do you want to unlock it?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Unlock', onPress: () => unlockWithCoins(episodeCost) }
          ]
        );
      } else {
        // Show ad or subscription options
        Alert.alert(
          'Premium Episode',
          'This episode requires a subscription or coins. You can also watch an ad to unlock it.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Watch Ad', onPress: () => showAdToUnlock() },
            { text: 'Subscribe', onPress: () => showSubscriptionModal() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check access. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const unlockWithCoins = async (cost: number) => {
    try {
      await coinService.spendCoins(cost);
      setCanPlay(true);
      trackEvent('episode_unlocked_coins', {
        drama_id: drama.id,
        episode_id: episode.id,
        coins_spent: cost
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock episode. Please try again.');
      navigation.goBack();
    }
  };

  const showAdToUnlock = async () => {
    try {
      const adShown = await adService.showRewardedAd();
      if (adShown) {
        setCanPlay(true);
        setAdWatched(true);
        trackEvent('episode_unlocked_ad', {
          drama_id: drama.id,
          episode_id: episode.id
        });
      } else {
        Alert.alert('Error', 'Unable to show ad. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to show ad. Please try again.');
    }
  };

  const showSubscriptionModal = () => {
    // Navigate to subscription screen
    navigation.navigate('Subscription');
  };

  const trackPlaybackStart = () => {
    trackEvent('episode_playback_started', {
      drama_id: drama.id,
      episode_id: episode.id,
      episode_title: episode.title,
      drama_title: drama.title
    });
  };

  const trackPlaybackEnd = () => {
    const watchPercentage = duration > 0 ? (watchTimeRef.current / duration) * 100 : 0;
    
    trackEvent('episode_playback_ended', {
      drama_id: drama.id,
      episode_id: episode.id,
      watch_time: watchTimeRef.current,
      watch_percentage: watchPercentage,
      completed: watchPercentage >= 80
    });

    // Add to watch history
    addToWatchHistory({
      drama_id: drama.id,
      episode_id: episode.id,
      watch_time: watchTimeRef.current,
      completed: watchPercentage >= 80
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      hideControlsAfterDelay();
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seek(time);
    }
  };

  const handleProgress = (progress: any) => {
    setCurrentTime(progress.currentTime);
    watchTimeRef.current = progress.currentTime;
  };

  const handleLoad = (meta: any) => {
    setDuration(meta.duration);
    setLoading(false);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    playNextEpisode();
  };

  const playNextEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.id === episode.id);
    const nextEpisode = episodes[currentIndex + 1];
    
    if (nextEpisode) {
      Alert.alert(
        'Episode Complete',
        'Would you like to play the next episode?',
        [
          { text: 'Stay', style: 'cancel' },
          { 
            text: 'Next Episode', 
            onPress: () => {
              navigation.replace('EpisodePlayer', {
                drama,
                episode: nextEpisode,
                episodes
              });
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Series Complete',
        'You have finished watching this series!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Player',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() }
      ]
    );
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) {
      hideControlsAfterDelay();
    }
  };

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Loading episode...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canPlay) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedText}>
            Access to this episode is restricted
          </Text>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.exitButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player Placeholder */}
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderText}>
            {drama.title} - {episode.title}
          </Text>
          <Text style={styles.videoSubText}>
            Episode {episode.episodeNumber}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
            >
              <Text style={styles.exitButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.episodeTitle}>{episode.title}</Text>
          </View>

          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸' : '▶️'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(currentTime / duration) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoSubText: {
    color: '#ccc',
    fontSize: 14,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
  exitButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 32,
  },
  bottomControls: {
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
});