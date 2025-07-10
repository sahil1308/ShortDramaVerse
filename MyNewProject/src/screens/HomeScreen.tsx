/**
 * HomeScreen - Main screen of the ShortDramaVerse app
 * 
 * This screen displays the main content feed with drama recommendations,
 * trending shows, and personalized content. Users can browse without
 * mandatory registration while the app tracks their behavior anonymously.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../../App';
import DramaCarousel from '../components/DramaCarousel';
import DramaRow from '../components/DramaRow';
import NotificationBanner from '../components/NotificationBanner';
import EmptyStateView from '../components/EmptyStateView';

// Import services
import { getRecommendations } from '../services/recommendations';
import { getPopularDramas, getFeaturedDramas } from '../services/content';
import { trackUserEngagement } from '../services/analytics';
import { getAnonymousUserId } from '../services/anonymousAuth';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

/**
 * HomeScreen Component
 * 
 * Main screen showing personalized drama recommendations and content discovery
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get anonymous user ID for personalized recommendations
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

  // Fetch featured dramas for the main carousel
  const { data: featuredDramas, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-dramas'],
    queryFn: getFeaturedDramas,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch popular dramas
  const { data: popularDramas, isLoading: isPopularLoading } = useQuery({
    queryKey: ['popular-dramas'],
    queryFn: getPopularDramas,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch personalized recommendations if user ID is available
  const { data: recommendations, isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => getRecommendations(userId || ''),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Track user engagement
      if (userId) {
        await trackUserEngagement(userId, 'home_refresh', {
          timestamp: new Date().toISOString(),
        });
      }
      
      // Refresh queries
      // The queries will automatically refetch when component re-renders
      setRefreshing(false);
    } catch (error) {
      console.error('Failed to refresh content:', error);
      setRefreshing(false);
    }
  };

  // Handle drama selection
  const handleDramaSelect = async (dramaId: string, episodeId: string) => {
    try {
      // Track user engagement
      if (userId) {
        await trackUserEngagement(userId, 'drama_select', {
          dramaId,
          episodeId,
          timestamp: new Date().toISOString(),
        });
      }
      
      navigation.navigate('VideoPlayer', { dramaId, episodeId });
    } catch (error) {
      console.error('Failed to track drama selection:', error);
      // Still navigate even if tracking fails
      navigation.navigate('VideoPlayer', { dramaId, episodeId });
    }
  };

  // Handle Quick Swipe navigation
  const handleQuickSwipePress = () => {
    navigation.navigate('QuickSwipe');
  };

  // Handle notification settings
  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  // Show loading state
  if (isFeaturedLoading && isPopularLoading && isRecommendationsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading ShortDramaVerse...</Text>
      </View>
    );
  }

  // Show empty state if no content is available
  if (!featuredDramas && !popularDramas && !recommendations) {
    return (
      <EmptyStateView
        title="No Content Available"
        description="We're having trouble loading content right now. Please try again later."
        onRetry={onRefresh}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShortDramaVerse</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleQuickSwipePress}
          >
            <Text style={styles.actionButtonText}>Quick Swipe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNotificationSettings}
          >
            <Text style={styles.actionButtonText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Banner */}
      <NotificationBanner />

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Featured Dramas Carousel */}
        {featuredDramas && featuredDramas.length > 0 && (
          <View style={styles.section}>
            <DramaCarousel
              dramas={featuredDramas}
              onDramaPress={handleDramaSelect}
            />
          </View>
        )}

        {/* Personalized Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <DramaRow
              dramas={recommendations}
              onDramaPress={handleDramaSelect}
            />
          </View>
        )}

        {/* Popular Dramas */}
        {popularDramas && popularDramas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Now</Text>
            <DramaRow
              dramas={popularDramas}
              onDramaPress={handleDramaSelect}
            />
          </View>
        )}

        {/* Content Discovery Hint */}
        <View style={styles.discoveryHint}>
          <Text style={styles.hintText}>
            🎭 Discover more content by swiping through our Quick Swipe feature!
          </Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={handleQuickSwipePress}
          >
            <Text style={styles.discoverButtonText}>Try Quick Swipe</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    backgroundColor: '#333333',
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  discoveryHint: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
  },
  hintText: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  discoverButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  discoverButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;