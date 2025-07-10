/**
 * QuickSwipeScreen - TikTok-like swipe interface for content discovery
 * 
 * This screen provides an intuitive content browsing experience with
 * vertical swipe gestures for discovering new drama content.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanGestureHandler,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../../App';

// Import services
import { getSwipeableContent } from '../services/content';
import { trackUserEngagement } from '../services/analytics';
import { getAnonymousUserId } from '../services/anonymousAuth';

type QuickSwipeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuickSwipe'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QuickSwipeScreen: React.FC = () => {
  const navigation = useNavigation<QuickSwipeScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

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

  // Fetch swipeable content
  const { data: content, isLoading } = useQuery({
    queryKey: ['swipeable-content'],
    queryFn: getSwipeableContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle swipe gestures
  const handleSwipeUp = async () => {
    if (content && currentIndex < content.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Track swipe engagement
      if (userId) {
        await trackUserEngagement(userId, 'quick_swipe_up', {
          contentId: content[currentIndex].id,
          newIndex,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const handleSwipeDown = async () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      
      // Track swipe engagement
      if (userId) {
        await trackUserEngagement(userId, 'quick_swipe_down', {
          contentId: content[currentIndex].id,
          newIndex,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  // Handle content selection
  const handleContentSelect = async () => {
    if (content && content[currentIndex]) {
      const selectedContent = content[currentIndex];
      
      // Track content selection
      if (userId) {
        await trackUserEngagement(userId, 'quick_swipe_select', {
          contentId: selectedContent.id,
          contentTitle: selectedContent.title,
          timestamp: new Date().toISOString(),
        });
      }
      
      navigation.navigate('VideoPlayer', {
        dramaId: selectedContent.dramaId,
        episodeId: selectedContent.episodeId,
      });
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (!content || content.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No content available</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentContent = content[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Swipe</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Swipe Gesture Handler */}
        <PanGestureHandler
          onGestureEvent={({ nativeEvent }) => {
            if (nativeEvent.translationY < -100) {
              handleSwipeUp();
            } else if (nativeEvent.translationY > 100) {
              handleSwipeDown();
            }
          }}
        >
          <View style={styles.swipeableArea}>
            {/* Content Card */}
            <TouchableOpacity
              style={styles.contentCard}
              onPress={handleContentSelect}
            >
              <View style={styles.contentPreview}>
                <Text style={styles.contentEmoji}>🎬</Text>
                <Text style={styles.contentTitle}>{currentContent.title}</Text>
                <Text style={styles.contentDescription}>
                  {currentContent.description}
                </Text>
                <Text style={styles.contentDuration}>
                  {currentContent.duration} min
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </PanGestureHandler>

        {/* Swipe Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            ↑ Swipe up for next content
          </Text>
          <Text style={styles.instructionText}>
            ↓ Swipe down for previous content
          </Text>
          <Text style={styles.instructionText}>
            Tap to watch
          </Text>
        </View>
      </View>

      {/* Content Counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {content.length}
        </Text>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  emptyText: {
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeableArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
  },
  contentCard: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.6,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentPreview: {
    alignItems: 'center',
  },
  contentEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  contentTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  contentDescription: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  contentDuration: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 4,
  },
  counter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QuickSwipeScreen;