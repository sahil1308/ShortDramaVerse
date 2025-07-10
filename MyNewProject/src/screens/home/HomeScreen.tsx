/**
 * Home Screen Component
 * 
 * Main screen displaying featured content, continue watching, and recommended series.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { DramaSeries, WatchHistory, Episode } from '@/types/drama';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { colors, spacing, typography } from '@/constants/theme';

// Components would be imported here
// import DramaCard from '@/components/DramaCard';
// import FeatureCarousel from '@/components/FeatureCarousel';
// import ContinueWatchingCard from '@/components/ContinueWatchingCard';

/**
 * Home Screen Component
 * 
 * @returns Home screen JSX
 */
const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { trackScreenView } = useAnalytics();
  
  // Track screen view
  useEffect(() => {
    trackScreenView('Home');
  }, [trackScreenView]);
  
  // Fetch featured series
  const { data: featuredSeries, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featuredSeries'],
    queryFn: () => api.get<DramaSeries[]>('/series/featured'),
  });
  
  // Fetch trending series
  const { data: trendingSeries, isLoading: loadingTrending } = useQuery({
    queryKey: ['trendingSeries'],
    queryFn: () => api.get<DramaSeries[]>('/series/trending'),
  });
  
  // Fetch recommended series
  const { data: recommendedSeries, isLoading: loadingRecommended } = useQuery({
    queryKey: ['recommendedSeries'],
    queryFn: () => api.get<DramaSeries[]>('/series/recommended'),
  });
  
  // Fetch continue watching
  const { data: continueWatching, isLoading: loadingContinueWatching } = useQuery({
    queryKey: ['continueWatching'],
    queryFn: () => api.get<WatchHistory[]>('/user/watch-history'),
    // Only fetch if user is logged in
    enabled: !!user,
  });
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Refetch all queries
      await Promise.all([
        // This would normally use the queryClient.refetchQueries method
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    
    setRefreshing(false);
  };
  
  // Handler for series press
  const handleSeriesPress = (seriesId: number, series?: DramaSeries) => {
    // Navigate to series detail screen
    navigation.navigate('SeriesDetail', {
      seriesId,
      series,
    });
  };
  
  // Handler for episode press
  const handleEpisodePress = (episodeId: number, seriesId: number, episode?: Episode) => {
    // Navigate to player screen
    navigation.navigate('Player', {
      episodeId,
      seriesId,
      episode,
    });
  };
  
  // Placeholder component for DramaCard
  const DramaCard = ({ series, onPress }: { series: DramaSeries; onPress: () => void }) => (
    <TouchableOpacity style={styles.dramaCard} onPress={onPress}>
      <ImageBackground
        source={{ uri: series.coverImage }}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{series.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
  
  // Placeholder component for ContinueWatchingCard
  const ContinueWatchingCard = ({ item, onPress }: { item: WatchHistory; onPress: () => void }) => (
    <TouchableOpacity style={styles.continueWatchingCard} onPress={onPress}>
      <ImageBackground
        source={{ uri: item.episode?.thumbnailImage }}
        style={styles.continueWatchingImage}
        imageStyle={styles.cardImageStyle}
      >
        <View style={styles.cardOverlay}>
          <Text style={styles.continueWatchingTitle}>{item.episode?.title}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
  
  // Placeholder component for Featured Series
  const renderFeaturedSeries = () => {
    if (loadingFeatured) {
      return <View style={styles.loadingPlaceholder} />;
    }
    
    if (!featuredSeries?.length) {
      return null;
    }
    
    return (
      <View style={styles.featuredContainer}>
        <ImageBackground
          source={{ uri: featuredSeries[0].bannerImage || featuredSeries[0].coverImage }}
          style={styles.featuredImage}
        >
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredTitle}>{featuredSeries[0].title}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {featuredSeries[0].description}
            </Text>
            <TouchableOpacity
              style={styles.watchButton}
              onPress={() => handleSeriesPress(featuredSeries[0].id, featuredSeries[0])}
            >
              <Text style={styles.watchButtonText}>Watch Now</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Featured Series */}
        {renderFeaturedSeries()}
        
        {/* Continue Watching */}
        {!!user && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            {loadingContinueWatching ? (
              <View style={styles.loadingPlaceholder} />
            ) : !continueWatching?.length ? (
              <Text style={styles.emptyStateText}>No episodes in progress</Text>
            ) : (
              <FlatList
                horizontal
                data={continueWatching}
                keyExtractor={(item) => `continue-${item.id}`}
                renderItem={({ item }) => (
                  <ContinueWatchingCard
                    item={item}
                    onPress={() => handleEpisodePress(item.episodeId, item.seriesId, item.episode)}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              />
            )}
          </View>
        )}
        
        {/* Trending Now */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          {loadingTrending ? (
            <View style={styles.loadingPlaceholder} />
          ) : !trendingSeries?.length ? (
            <Text style={styles.emptyStateText}>No trending series available</Text>
          ) : (
            <FlatList
              horizontal
              data={trendingSeries}
              keyExtractor={(item) => `trending-${item.id}`}
              renderItem={({ item }) => (
                <DramaCard
                  series={item}
                  onPress={() => handleSeriesPress(item.id, item)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
            />
          )}
        </View>
        
        {/* Recommended For You */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          {loadingRecommended ? (
            <View style={styles.loadingPlaceholder} />
          ) : !recommendedSeries?.length ? (
            <Text style={styles.emptyStateText}>No recommendations available</Text>
          ) : (
            <FlatList
              horizontal
              data={recommendedSeries}
              keyExtractor={(item) => `recommended-${item.id}`}
              renderItem={({ item }) => (
                <DramaCard
                  series={item}
                  onPress={() => handleSeriesPress(item.id, item)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  sectionContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.onBackground,
  },
  horizontalListContent: {
    paddingRight: spacing.md,
  },
  loadingPlaceholder: {
    height: 180,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    color: colors.gray,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  featuredContainer: {
    width: '100%',
    height: 300,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.lg,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.white,
    marginBottom: spacing.md,
  },
  watchButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  dramaCard: {
    width: 130,
    height: 190,
    marginRight: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 8,
  },
  cardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.sm,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  continueWatchingCard: {
    width: 200,
    height: 120,
    marginRight: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  continueWatchingImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  continueWatchingTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

export default HomeScreen;