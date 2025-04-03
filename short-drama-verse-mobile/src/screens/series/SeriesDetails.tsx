import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/services/api';
import { DramaSeries, Episode, Rating } from '@/types/drama';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/screens/common/LoadingScreen';

type SeriesDetailsRouteProp = RouteProp<RootStackParamList, 'SeriesDetails'>;
type SeriesDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Episode card component
interface EpisodeCardProps {
  episode: Episode;
  onPress: () => void;
}

const EpisodeCard = ({ episode, onPress }: EpisodeCardProps) => (
  <TouchableOpacity style={styles.episodeCard} onPress={onPress}>
    <Image
      source={{ uri: episode.thumbnailImage }}
      style={styles.episodeThumbnail}
    />
    <View style={styles.episodeInfo}>
      <Text style={styles.episodeTitle}>
        {episode.episodeNumber}. {episode.title}
      </Text>
      <Text style={styles.episodeDuration}>{Math.floor(episode.duration / 60)} min</Text>
      {episode.isPremium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </View>
    <Ionicons name="play-circle-outline" size={24} color="#FF5A5F" />
  </TouchableOpacity>
);

export default function SeriesDetails() {
  const route = useRoute<SeriesDetailsRouteProp>();
  const navigation = useNavigation<SeriesDetailsNavigationProp>();
  const { seriesId } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get series details
  const { data: series, isLoading: isLoadingSeries } = useQuery<DramaSeries>(
    ['series', seriesId],
    async () => {
      const response = await api.get(endpoints.series.byId(seriesId));
      return response.data;
    }
  );

  // Get episodes
  const { data: episodes, isLoading: isLoadingEpisodes } = useQuery<Episode[]>(
    ['episodes', seriesId],
    async () => {
      const response = await api.get(endpoints.episodes.bySeries(seriesId));
      return response.data;
    }
  );

  // Get ratings
  const { data: ratings, isLoading: isLoadingRatings } = useQuery<Rating[]>(
    ['ratings', seriesId],
    async () => {
      const response = await api.get(endpoints.ratings.bySeries(seriesId));
      return response.data;
    }
  );

  // Check if series is in watchlist
  const { data: isInWatchlist, isLoading: isLoadingWatchlist } = useQuery<boolean>(
    ['watchlist', seriesId],
    async () => {
      if (!user) return false;
      const response = await api.get(`${endpoints.watchlist.get}/check/${seriesId}`);
      return response.data.inWatchlist;
    },
    {
      enabled: !!user,
    }
  );

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation(
    async () => {
      await api.post(endpoints.watchlist.add, { seriesId });
    },
    {
      onSuccess: () => {
        queryClient.setQueryData(['watchlist', seriesId], true);
      },
    }
  );

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation(
    async () => {
      await api.delete(endpoints.watchlist.remove(seriesId));
    },
    {
      onSuccess: () => {
        queryClient.setQueryData(['watchlist', seriesId], false);
      },
    }
  );

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const navigateToEpisode = (episodeId: number) => {
    navigation.navigate('EpisodePlayer', { episodeId, seriesId });
  };

  if (isLoadingSeries || isLoadingEpisodes) {
    return <LoadingScreen />;
  }

  if (!series || !episodes) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load series details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView>
        {/* Series Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: series.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerOverlay}>
            <Text style={styles.title}>{series.title}</Text>
            <View style={styles.genreContainer}>
              {series.genre.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>{series.releaseYear}</Text>
              <Text style={styles.metaText}>Directed by {series.director}</Text>
              {series.averageRating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{series.averageRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {episodes.length > 0 && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => navigateToEpisode(episodes[0].id)}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={handleWatchlistToggle}
            disabled={!user || addToWatchlistMutation.isLoading || removeFromWatchlistMutation.isLoading}
          >
            <Ionicons
              name={isInWatchlist ? "bookmark" : "bookmark-outline"}
              size={20}
              color="#333"
            />
            <Text style={styles.watchlistButtonText}>
              {isInWatchlist ? "Remove" : "Add to Watchlist"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>{series.description}</Text>
        </View>
        
        {/* Cast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <View style={styles.castContainer}>
            {series.actors.map((actor, index) => (
              <Text key={index} style={styles.castText}>
                {actor}
                {index < series.actors.length - 1 ? ", " : ""}
              </Text>
            ))}
          </View>
        </View>
        
        {/* Episodes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          {episodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              onPress={() => navigateToEpisode(episode.id)}
            />
          ))}
        </View>
        
        {/* Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          {ratings && ratings.length > 0 ? (
            ratings.map((rating) => (
              <View key={rating.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {rating.user && (
                    <Text style={styles.reviewerName}>{rating.user.username}</Text>
                  )}
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.reviewRatingText}>{rating.rating}</Text>
                  </View>
                </View>
                {rating.comment && (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5A5F',
    textAlign: 'center',
  },
  header: {
    position: 'relative',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  genreTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#ddd',
    fontSize: 14,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5A5F',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    flex: 1,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
  },
  watchlistButtonText: {
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  castContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  castText: {
    fontSize: 15,
    color: '#555',
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  episodeThumbnail: {
    width: 100,
    height: 60,
    borderRadius: 5,
  },
  episodeInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  episodeDuration: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 5,
    color: '#333',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  noReviewsText: {
    color: '#777',
    fontStyle: 'italic',
  },
});