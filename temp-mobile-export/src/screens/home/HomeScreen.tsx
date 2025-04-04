/**
 * Home Screen for ShortDramaVerse Mobile
 * 
 * This is the main screen users see after login, featuring personalized 
 * drama recommendations, continue watching section, and trending content.
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

// Components
import DramaCarousel from '@/components/DramaCarousel';
import DramaRow from '@/components/DramaRow';
import EmptyStateView from '@/components/EmptyStateView';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';

// Types and services
import { DramaSeries, Episode } from '@/types/drama';
import apiService from '@/services/api';
import { EventType } from '@/services/analytics';

/**
 * Home Screen Component
 * 
 * Main landing screen with personalized content after user login.
 * 
 * @returns Home screen component
 */
const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { trackScreenView, trackEvent } = useAnalytics();
  
  // Track screen view on component mount
  useEffect(() => {
    trackScreenView('Home');
  }, [trackScreenView]);
  
  // Fetch featured drama series
  const { 
    data: featuredSeries,
    isLoading: isLoadingFeatured,
    refetch: refetchFeatured
  } = useQuery({
    queryKey: ['featuredSeries'],
    queryFn: () => apiService.getFeaturedSeries(),
  });
  
  // Fetch continue watching content
  const { 
    data: continueWatching,
    isLoading: isLoadingContinue,
    refetch: refetchContinue
  } = useQuery({
    queryKey: ['continueWatching'],
    queryFn: () => apiService.getContinueWatching(),
    enabled: !!user, // Only run if user is logged in
  });
  
  // Fetch trending series
  const { 
    data: trendingSeries,
    isLoading: isLoadingTrending,
    refetch: refetchTrending
  } = useQuery({
    queryKey: ['trendingSeries'],
    queryFn: () => apiService.getTrendingSeries(),
  });
  
  // Fetch new releases
  const { 
    data: newReleases,
    isLoading: isLoadingNew,
    refetch: refetchNew
  } = useQuery({
    queryKey: ['newReleases'],
    queryFn: () => apiService.getNewReleases(),
  });
  
  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    
    try {
      await Promise.all([
        refetchFeatured(),
        refetchContinue(),
        refetchTrending(),
        refetchNew()
      ]);
    } catch (error) {
      console.error('Error refreshing home screen data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFeatured, refetchContinue, refetchTrending, refetchNew]);
  
  // Handler for opening search screen
  const handleSearchPress = () => {
    trackEvent(EventType.SEARCH_OPENED, { source: 'home_screen' });
    navigation.navigate('Search' as never);
  };
  
  // Handler for series selection
  const handleSeriesPress = (series: DramaSeries) => {
    trackEvent(EventType.SERIES_SELECTED, { 
      seriesId: series.id,
      seriesTitle: series.title,
      source: 'home_screen' 
    });
    
    navigation.navigate('SeriesDetails' as never, { 
      seriesId: series.id,
      title: series.title 
    } as never);
  };
  
  // Handler for continue watching selection
  const handleContinueWatchingPress = (episode: Episode) => {
    trackEvent(EventType.RESUME_WATCHING, { 
      episodeId: episode.id,
      seriesId: episode.seriesId,
      episodeTitle: episode.title,
      source: 'home_screen' 
    });
    
    navigation.navigate('EpisodePlayer' as never, {
      episodeId: episode.id,
      seriesId: episode.seriesId,
      title: episode.title,
      startPosition: episode.watchProgress || 0
    } as never);
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user ? `Hi, ${user.displayName || user.username}` : 'Welcome'}
        </Text>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearchPress}
        >
          <Feather name="search" size={22} color="#333333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Featured Carousel */}
        <View style={styles.carouselContainer}>
          <DramaCarousel 
            data={featuredSeries || []}
            isLoading={isLoadingFeatured}
            onItemPress={handleSeriesPress}
          />
        </View>
        
        {/* Continue Watching Section */}
        {user && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Watching</Text>
              {continueWatching && continueWatching.length > 0 && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isLoadingContinue ? (
              <DramaRow 
                type="continue"
                isLoading={true}
                data={[]}
                onItemPress={() => {}}
              />
            ) : continueWatching && continueWatching.length > 0 ? (
              <DramaRow 
                type="continue"
                data={continueWatching}
                onItemPress={handleContinueWatchingPress}
              />
            ) : (
              <EmptyStateView 
                icon="play-circle-outline"
                message="You haven't watched any dramas yet"
                actionText="Explore dramas"
                onAction={() => navigation.navigate('Explore' as never)}
              />
            )}
          </View>
        )}
        
        {/* Trending Series Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            {trendingSeries && trendingSeries.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <DramaRow 
            type="horizontal"
            data={trendingSeries || []}
            isLoading={isLoadingTrending}
            onItemPress={handleSeriesPress}
          />
        </View>
        
        {/* New Releases Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Releases</Text>
            {newReleases && newReleases.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <DramaRow 
            type="horizontal"
            data={newReleases || []}
            isLoading={isLoadingNew}
            onItemPress={handleSeriesPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  carouselContainer: {
    marginVertical: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
});

export default HomeScreen;