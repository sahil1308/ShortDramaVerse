/**
 * Series Detail Screen
 * 
 * Displays detailed information about a drama series, including episodes.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DramaSeries, Episode, Rating } from '@/types/drama';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { colors, spacing, typography, shadows } from '@/constants/theme';

/**
 * Series Detail Screen Component
 * 
 * @returns Series detail screen JSX
 */
const SeriesDetailScreen = () => {
  // Navigation
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get series ID from route params
  const { seriesId, series: initialSeries } = route.params as {
    seriesId: number;
    series?: DramaSeries;
  };
  
  // State
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [userRating, setUserRating] = useState(0);
  
  // Auth, Analytics, and QueryClient
  const { user } = useAuth();
  const { trackScreenView, trackAddToWatchlist, trackRemoveFromWatchlist, trackRateContent, trackShareContent } = useAnalytics();
  const queryClient = useQueryClient();
  
  // Fetch series data
  const { 
    data: series,
    isLoading: loadingSeries,
    error: seriesError
  } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => api.get<DramaSeries>(`/series/${seriesId}`),
    // Use initial series data if available
    initialData: initialSeries,
  });
  
  // Fetch episodes
  const {
    data: episodes,
    isLoading: loadingEpisodes,
    error: episodesError
  } = useQuery({
    queryKey: ['series', seriesId, 'episodes'],
    queryFn: () => api.get<Episode[]>(`/series/${seriesId}/episodes`),
  });
  
  // Fetch series ratings
  const {
    data: ratings,
    isLoading: loadingRatings,
  } = useQuery({
    queryKey: ['series', seriesId, 'ratings'],
    queryFn: () => api.get<Rating[]>(`/series/${seriesId}/ratings`),
  });
  
  // Fetch watchlist status
  const {
    data: isInWatchlist,
    isLoading: loadingWatchlist,
  } = useQuery({
    queryKey: ['watchlist', seriesId],
    queryFn: () => api.get<boolean>(`/user/watchlist/check/${seriesId}`),
    // Only fetch if user is logged in
    enabled: !!user,
  });
  
  // Fetch user rating
  const {
    data: userRatingData,
  } = useQuery({
    queryKey: ['rating', seriesId, user?.id],
    queryFn: () => api.get<Rating>(`/series/${seriesId}/ratings/user`),
    // Only fetch if user is logged in
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setUserRating(data.rating);
      }
    },
  });
  
  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: () => api.post(`/user/watchlist`, { seriesId }),
    onSuccess: () => {
      queryClient.setQueryData(['watchlist', seriesId], true);
      trackAddToWatchlist(seriesId);
    },
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: () => api.delete(`/user/watchlist/${seriesId}`),
    onSuccess: () => {
      queryClient.setQueryData(['watchlist', seriesId], false);
      trackRemoveFromWatchlist(seriesId);
    },
  });
  
  // Rate series mutation
  const rateSeriesMutation = useMutation({
    mutationFn: (rating: number) => {
      return api.post(`/series/${seriesId}/ratings`, { rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', seriesId, 'ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating', seriesId, user?.id] });
      trackRateContent(seriesId, userRating);
    },
  });
  
  // Track screen view
  useEffect(() => {
    trackScreenView('SeriesDetail', { series_id: seriesId, title: series?.title });
  }, [seriesId, series?.title, trackScreenView]);
  
  // Toggle watchlist
  const toggleWatchlist = () => {
    if (!user) {
      // Navigate to auth screen if not logged in
      navigation.navigate('Auth');
      return;
    }
    
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };
  
  // Rate series
  const rateSeries = (rating: number) => {
    if (!user) {
      // Navigate to auth screen if not logged in
      navigation.navigate('Auth');
      return;
    }
    
    setUserRating(rating);
    rateSeriesMutation.mutate(rating);
  };
  
  // Share series
  const shareSeries = async () => {
    if (!series) return;
    
    try {
      const result = await Share.share({
        message: `Check out "${series.title}" on ShortDramaVerse! ${series.description.substring(0, 100)}...`,
        url: `https://shortdramaverse.com/series/${seriesId}`,
      });
      
      if (result.action === Share.sharedAction) {
        const shareMethod = result.activityType || 'unknown';
        trackShareContent(seriesId, shareMethod);
      }
    } catch (error) {
      console.error('Error sharing series:', error);
    }
  };
  
  // Navigate to episode player
  const playEpisode = (episode: Episode) => {
    navigation.navigate('Player', {
      episodeId: episode.id,
      seriesId,
      episode,
    });
  };
  
  // Go back
  const goBack = () => {
    navigation.goBack();
  };
  
  // Toggle description expansion
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  
  // Render stars for rating
  const renderRatingStars = (rating: number, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={`star-${i}`}
          onPress={interactive ? () => rateSeries(i) : undefined}
          style={styles.starContainer}
        >
          <Text style={[styles.star, i <= rating ? styles.filledStar : styles.emptyStar]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingStars}>{stars}</View>;
  };
  
  // If loading
  if (loadingSeries && !series) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading series information...</Text>
      </View>
    );
  }
  
  // If error
  if (seriesError && !series) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Failed to load series information. Please try again.
        </Text>
        <TouchableOpacity style={styles.errorButton} onPress={goBack}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.scrollView}>
        {/* Header/Banner */}
        <ImageBackground
          source={{ uri: series?.bannerImage || series?.coverImage }}
          style={styles.banner}
        >
          <View style={styles.bannerOverlay}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <View style={styles.bannerContent}>
              <Text style={styles.title}>{series?.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{series?.releaseYear}</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>{series?.totalEpisodes} Episodes</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>{series?.country}</Text>
              </View>
              <View style={styles.genreRow}>
                {series?.genre.map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingValue}>{series?.averageRating.toFixed(1)}</Text>
                {renderRatingStars(Math.round(series?.averageRating || 0))}
              </View>
            </View>
          </View>
        </ImageBackground>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleWatchlist}
            disabled={!user || loadingWatchlist}
          >
            <Text style={styles.actionButtonText}>
              {loadingWatchlist
                ? 'Loading...'
                : isInWatchlist
                ? 'Remove from Watchlist'
                : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={shareSeries}>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        {/* Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 3}>
            {series?.description}
          </Text>
          <TouchableOpacity onPress={toggleDescription} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>
              {showFullDescription ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Cast and Crew */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cast & Crew</Text>
          <View style={styles.castRow}>
            <View style={styles.castItem}>
              <Text style={styles.castLabel}>Director</Text>
              <Text style={styles.castValue}>{series?.director}</Text>
            </View>
          </View>
          
          <Text style={styles.castSubtitle}>Cast</Text>
          <View style={styles.castRow}>
            {series?.cast.map((castMember, index) => (
              <View key={index} style={styles.castItem}>
                <Text style={styles.castValue}>{castMember}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Episodes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          {loadingEpisodes ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : episodesError ? (
            <Text style={styles.errorText}>Failed to load episodes.</Text>
          ) : !episodes?.length ? (
            <Text style={styles.noContentText}>No episodes available.</Text>
          ) : (
            <FlatList
              data={episodes}
              keyExtractor={(item) => `episode-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.episodeItem}
                  onPress={() => playEpisode(item)}
                >
                  <Image
                    source={{ uri: item.thumbnailImage }}
                    style={styles.episodeThumbnail}
                  />
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle}>
                      {item.episodeNumber}. {item.title}
                    </Text>
                    <Text style={styles.episodeDuration}>
                      {Math.floor(item.duration / 60)}m {item.duration % 60}s
                    </Text>
                    <Text style={styles.episodeDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  {!item.isFree && !user && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              style={styles.episodeList}
              scrollEnabled={false}
            />
          )}
        </View>
        
        {/* User Rating */}
        {user && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <View style={styles.userRatingContainer}>
              {renderRatingStars(userRating, true)}
              <Text style={styles.userRatingText}>
                {userRating > 0
                  ? `You rated this ${userRating}/5`
                  : 'Tap to rate this series'}
              </Text>
            </View>
          </View>
        )}
        
        {/* Reviews */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {loadingRatings ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : !ratings?.length ? (
            <Text style={styles.noContentText}>No reviews yet.</Text>
          ) : (
            ratings.slice(0, 3).map((rating) => (
              <View key={`rating-${rating.id}`} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUser}>
                    {rating.user?.profilePicture ? (
                      <Image
                        source={{ uri: rating.user.profilePicture }}
                        style={styles.reviewAvatar}
                      />
                    ) : (
                      <View style={[styles.reviewAvatar, styles.reviewAvatarPlaceholder]}>
                        <Text style={styles.reviewAvatarText}>
                          {rating.user?.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.reviewUsername}>{rating.user?.username}</Text>
                  </View>
                  {renderRatingStars(rating.rating)}
                </View>
                {rating.comment && (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                )}
              </View>
            ))
          )}
          
          {ratings && ratings.length > 3 && (
            <TouchableOpacity style={styles.moreReviewsButton}>
              <Text style={styles.moreReviewsText}>
                View All Reviews ({ratings.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.bottomSpacing} />
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
  scrollView: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 300,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + spacing.md : spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
  },
  bannerContent: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaText: {
    color: colors.white,
    fontSize: 14,
  },
  metaSeparator: {
    color: colors.white,
    marginHorizontal: spacing.xs,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  genreText: {
    color: colors.white,
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  starContainer: {
    padding: 2,
  },
  star: {
    fontSize: 18,
  },
  filledStar: {
    color: colors.secondary,
  },
  emptyStar: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.onBackground,
  },
  description: {
    fontSize: 14,
    color: colors.onBackground,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: spacing.sm,
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  castRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  castSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.onBackground,
  },
  castItem: {
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  castLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  castValue: {
    fontSize: 14,
    color: colors.onBackground,
  },
  episodeList: {
    marginTop: spacing.sm,
  },
  episodeItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  episodeThumbnail: {
    width: 120,
    height: 80,
  },
  episodeInfo: {
    flex: 1,
    padding: spacing.sm,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    color: colors.onBackground,
  },
  episodeDuration: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 12,
    color: colors.darkGray,
  },
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  premiumText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  userRatingContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userRatingText: {
    marginTop: spacing.sm,
    color: colors.gray,
  },
  reviewItem: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    ...shadows.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: spacing.sm,
  },
  reviewAvatarPlaceholder: {
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  reviewUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onBackground,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.onBackground,
    lineHeight: 20,
  },
  moreReviewsButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  moreReviewsText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
  },
  errorButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  noContentText: {
    color: colors.gray,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SeriesDetailScreen;