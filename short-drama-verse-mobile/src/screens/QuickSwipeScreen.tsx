/**
 * QuickSwipeScreen
 * 
 * Main screen for the Quick-Swipe Content Accessibility Mode.
 * Allows users to efficiently browse content with intuitive swipe gestures.
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Share,
  Alert,
  AccessibilityInfo,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import SwipeableCard, { SwipeDirection } from '@/components/SwipeableCard';
import QuickSwipeGuide, { shouldShowQuickSwipeGuide } from '@/components/QuickSwipeGuide';
import { DramaSeries } from '@/types/content';
import { useTrending, useWatchlist } from '@/hooks/useContent';
import { useRecommendations } from '@/hooks/useRecommendations';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';

// Number of cards to preload
const PRELOAD_CARD_COUNT = 5;

const QuickSwipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [contentItems, setContentItems] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [pageTitle, setPageTitle] = useState('For You');
  const [showGuide, setShowGuide] = useState(false);
  
  // References
  const swipedItemsRef = useRef<Set<number>>(new Set());
  
  // Get content
  const { 
    data: recommendedContent, 
    isLoading: isRecommendationsLoading,
    refresh: refreshRecommendations
  } = useRecommendations();
  
  const { 
    data: trendingContent, 
    isLoading: isTrendingLoading,
    refresh: refreshTrending
  } = useTrending(20);
  
  const {
    addToWatchlist,
    isInWatchlist
  } = useWatchlist();
  
  // Listen for accessibility changes
  useEffect(() => {
    const checkAccessibilityStatus = async () => {
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsAccessibilityMode(screenReaderEnabled);
    };
    
    checkAccessibilityStatus();
    
    // Subscribe to accessibility status changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      checkAccessibilityStatus
    );
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Check if we should show the guide
  useEffect(() => {
    const checkGuideStatus = async () => {
      const shouldShow = await shouldShowQuickSwipeGuide();
      setShowGuide(shouldShow);
    };
    
    checkGuideStatus();
  }, []);
  
  // Load content
  useEffect(() => {
    loadContent();
  }, [recommendedContent, trendingContent]);
  
  const loadContent = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let newContent: DramaSeries[] = [];
      
      // Add recommended content
      if (recommendedContent && recommendedContent.length > 0) {
        newContent = recommendedContent.map(item => item.series);
        setPageTitle('For You');
      } 
      // Fall back to trending if no recommendations
      else if (trendingContent && trendingContent.length > 0) {
        newContent = trendingContent;
        setPageTitle('Trending');
      }
      
      // Filter out already swiped items
      const filteredContent = newContent.filter(
        item => !swipedItemsRef.current.has(item.id)
      );
      
      setContentItems(filteredContent);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshContent = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        refreshRecommendations(),
        refreshTrending()
      ]);
      
      // Reset swiped items
      swipedItemsRef.current.clear();
    } catch (err) {
      console.error('Error refreshing content:', err);
      setError('Failed to refresh content. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle card swipe
  const handleSwipe = async (direction: SwipeDirection, content: DramaSeries) => {
    // Add to swiped items
    swipedItemsRef.current.add(content.id);
    
    // Track the swipe action in analytics
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'content_swipe',
      content_id: content.id,
      content_type: 'series',
      direction
    });
    
    // Perform action based on swipe direction
    switch (direction) {
      case SwipeDirection.RIGHT:
        // Add to watchlist
        try {
          await addToWatchlist(content.id, 'series');
          
          // Track watchlist add in analytics
          analyticsService.trackEvent(AnalyticsEventType.CONTENT_BOOKMARK, {
            content_id: content.id,
            content_type: 'series',
            method: 'swipe'
          });
        } catch (err) {
          console.error('Error adding to watchlist:', err);
          Alert.alert('Error', 'Failed to add to watchlist. Please try again.');
        }
        break;
        
      case SwipeDirection.LEFT:
        // Skip this content
        break;
        
      case SwipeDirection.UP:
        // Navigate to details page
        navigation.navigate('SeriesDetail', { seriesId: content.id });
        
        // Track navigation
        analyticsService.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
          screen_name: 'SeriesDetail',
          content_id: content.id,
          source: 'quick_swipe'
        });
        break;
        
      case SwipeDirection.DOWN:
        // Share content
        try {
          await Share.share({
            message: `Check out ${content.title} on ShortDramaVerse!`,
            url: `shortdramaverse://series/${content.id}`
          });
          
          // Track share
          analyticsService.trackEvent(AnalyticsEventType.SHARE, {
            content_id: content.id,
            content_type: 'series'
          });
        } catch (err) {
          console.error('Error sharing content:', err);
        }
        break;
    }
    
    // Move to next card
    setCurrentIndex(prevIndex => prevIndex + 1);
    
    // If we're running low on cards, load more
    if (currentIndex + 1 >= contentItems.length - 2) {
      loadContent();
    }
  };
  
  // Handle card tap
  const handleCardTap = (content: DramaSeries) => {
    // Navigate to details page
    navigation.navigate('SeriesDetail', { seriesId: content.id });
    
    // Track navigation
    analyticsService.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screen_name: 'SeriesDetail',
      content_id: content.id,
      source: 'quick_swipe_tap'
    });
  };
  
  // Render cards
  const renderCards = () => {
    if (isLoading || contentItems.length === 0) {
      return null;
    }
    
    // Only render a few cards at a time to improve performance
    const cardRange = Math.min(contentItems.length, currentIndex + PRELOAD_CARD_COUNT);
    
    return contentItems
      .slice(currentIndex, cardRange)
      .map((item, index) => {
        // Only the top card should be interactive
        if (index > 2) return null;
        
        // Calculate card position and scale for stacking effect
        const isTopCard = index === 0;
        const cardStyle = {
          top: 10 + index * 7,
          zIndex: 5 - index,
          opacity: 1 - (index * 0.2), // Fade cards as they go deeper in the stack
          transform: [{ scale: 1 - (index * 0.05) }], // Scale down cards as they go deeper
        };
        
        const isInUserWatchlist = isInWatchlist(item.id, 'series');
        
        return (
          <View key={item.id} style={[styles.cardContainer, cardStyle]}>
            <SwipeableCard
              content={item}
              contentType="series"
              onSwipe={(direction, content) => isTopCard && handleSwipe(direction, content as DramaSeries)}
              onTap={(content) => isTopCard && handleCardTap(content as DramaSeries)}
              showTags={true}
              accessibilityHints={isAccessibilityMode}
              renderOverlay={(direction) => (
                <View style={styles.watchlistOverlay}>
                  {isInUserWatchlist && (
                    <View style={styles.inWatchlistBadge}>
                      <FontAwesome name="check" size={12} color="#fff" />
                      <Text style={styles.inWatchlistText}>In Watchlist</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        );
      });
  };
  
  // Render main content
  const renderContent = () => {
    if (isLoading || isRefreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff5e3a" />
          <Text style={styles.loadingText}>
            {isRefreshing ? 'Refreshing content...' : 'Loading content...'}
          </Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ff5e3a" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshContent}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (contentItems.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="playlist-play" size={48} color="#666" />
          <Text style={styles.emptyText}>No more content to show</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshContent}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Regular content view with cards
    return (
      <View style={styles.cardsContainer}>
        {renderCards()}
      </View>
    );
  };
  
  // Handle guide close
  const handleGuideClose = () => {
    setShowGuide(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
        <TouchableOpacity 
          style={styles.refreshIcon}
          onPress={refreshContent}
          disabled={isLoading || isRefreshing}
        >
          <MaterialIcons 
            name="refresh" 
            size={26} 
            color={isRefreshing ? "#999" : "#333"} 
          />
        </TouchableOpacity>
      </View>
      
      {renderContent()}
      
      <View style={styles.footer}>
        <View style={styles.swipeHelpContainer}>
          <View style={styles.swipeHelp}>
            <FontAwesome name="chevron-left" size={16} color="#666" />
            <Text style={styles.swipeHelpText}>Skip</Text>
          </View>
          
          <View style={styles.swipeHelp}>
            <FontAwesome name="chevron-up" size={16} color="#666" />
            <Text style={styles.swipeHelpText}>Details</Text>
          </View>
          
          <View style={styles.swipeHelp}>
            <FontAwesome name="chevron-down" size={16} color="#666" />
            <Text style={styles.swipeHelpText}>Share</Text>
          </View>
          
          <View style={styles.swipeHelp}>
            <FontAwesome name="chevron-right" size={16} color="#666" />
            <Text style={styles.swipeHelpText}>Watchlist</Text>
          </View>
        </View>
      </View>
      
      {/* Show quick swipe guide if needed */}
      {showGuide && <QuickSwipeGuide onClose={handleGuideClose} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff5e3a',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff5e3a',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff5e3a',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  swipeHelpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swipeHelp: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  swipeHelpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  watchlistOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  inWatchlistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 163, 68, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inWatchlistText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default QuickSwipeScreen;