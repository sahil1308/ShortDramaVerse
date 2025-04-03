import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';
import { useQuery, useMutation } from '@tanstack/react-query';
import api, { endpoints } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingScreen from '@/screens/common/LoadingScreen';
import { DramaSeries, Episode } from '@/types/drama';
import { queryClient } from '@/lib/queryClient';

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
  rating: '#FFD700',
  premium: '#FFD700',
  gradient: ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)'],
};

// Types
type SeriesDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'SeriesDetails'>;

const SeriesDetailsScreen = ({ route, navigation }: SeriesDetailsScreenProps) => {
  const { seriesId } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('episodes');
  
  // Fetch series details
  const { 
    data: series, 
    isLoading: isLoadingSeries, 
    error: seriesError,
    refetch: refetchSeries,
  } = useQuery({
    queryKey: ['dramaSeries', seriesId],
    queryFn: () => api.get<DramaSeries>(`${endpoints.dramaSeries.byId}/${seriesId}`),
  });
  
  // Fetch episodes
  const { 
    data: episodes, 
    isLoading: isLoadingEpisodes, 
    error: episodesError,
    refetch: refetchEpisodes,
  } = useQuery({
    queryKey: ['episodes', seriesId],
    queryFn: () => api.get<Episode[]>(`${endpoints.episodes.bySeries}/${seriesId}`),
    enabled: !!series,
  });
  
  // Check if series is in watchlist
  const { 
    data: isInWatchlist, 
    isLoading: isLoadingWatchlist, 
  } = useQuery({
    queryKey: ['watchlist', 'check', seriesId],
    queryFn: () => api.get<boolean>(`${endpoints.watchlist.check}/${seriesId}`),
    enabled: !!user,
  });
  
  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: (seriesId: number) => 
      api.post(endpoints.watchlist.add, { userId: user?.id, seriesId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.setQueryData(['watchlist', 'check', seriesId], true);
    },
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: (seriesId: number) => 
      api.post(`${endpoints.watchlist.remove}/${seriesId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.setQueryData(['watchlist', 'check', seriesId], false);
    },
  });
  
  // Toggle watchlist
  const toggleWatchlist = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add series to your watchlist.');
      return;
    }
    
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate(seriesId);
    } else {
      addToWatchlistMutation.mutate(seriesId);
    }
  };
  
  // Play episode
  const playEpisode = (episode: Episode) => {
    if (episode.isPremium && !user?.coinBalance) {
      Alert.alert(
        'Premium Content',
        'This episode requires premium access. Please purchase coins to unlock.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Coins', onPress: () => navigation.navigate('UserProfile') },
        ]
      );
      return;
    }
    
    navigation.navigate('EpisodePlayer', { 
      episodeId: episode.id,
      seriesId: seriesId,
    });
  };
  
  if (isLoadingSeries || isLoadingEpisodes) {
    return <LoadingScreen message="Loading series details..." />;
  }
  
  if (seriesError || !series) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading series details.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetchSeries()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView>
        {/* Hero Section with Cover Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: series.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={colors.gradient}
            style={styles.gradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.title}>{series.title}</Text>
            
            <View style={styles.metaContainer}>
              {/* Rating */}
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.rating} />
                <Text style={styles.ratingText}>{series.averageRating.toFixed(1)}</Text>
              </View>
              
              {/* Year */}
              <Text style={styles.metaText}>
                {new Date(series.releaseDate).getFullYear()}
              </Text>
              
              {/* Premium Badge */}
              {series.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={12} color={colors.primary} />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              )}
            </View>
            
            <View style={styles.genreContainer}>
              {series.genre.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {/* Play Button */}
              {episodes && episodes.length > 0 && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => playEpisode(episodes[0])}
                >
                  <Ionicons name="play" size={20} color={colors.text} />
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
              )}
              
              {/* Watchlist Button */}
              <TouchableOpacity
                style={styles.watchlistButton}
                onPress={toggleWatchlist}
                disabled={isLoadingWatchlist || addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
              >
                <Ionicons
                  name={isInWatchlist ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={colors.text}
                />
                <Text style={styles.watchlistButtonText}>
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'episodes' && styles.activeTab]}
            onPress={() => setActiveTab('episodes')}
          >
            <Text style={[styles.tabText, activeTab === 'episodes' && styles.activeTabText]}>
              Episodes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'related' && styles.activeTab]}
            onPress={() => setActiveTab('related')}
          >
            <Text style={[styles.tabText, activeTab === 'related' && styles.activeTabText]}>
              Related
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {/* Episodes Tab */}
          {activeTab === 'episodes' && (
            <>
              {episodesError ? (
                <View style={styles.tabErrorContainer}>
                  <Text style={styles.errorText}>Error loading episodes.</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => refetchEpisodes()}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : episodes && episodes.length > 0 ? (
                <FlatList
                  data={episodes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.episodeItem}
                      onPress={() => playEpisode(item)}
                    >
                      {/* Episode Thumbnail */}
                      <View style={styles.episodeImageContainer}>
                        <Image
                          source={{ uri: item.thumbnail || series.coverImage }}
                          style={styles.episodeThumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.episodeDuration}>
                          <Text style={styles.durationText}>
                            {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                          </Text>
                        </View>
                        
                        {/* Premium Badge */}
                        {item.isPremium && (
                          <View style={styles.episodePremiumBadge}>
                            <Ionicons name="diamond" size={10} color={colors.background} />
                            <Text style={styles.episodePremiumText}>PREMIUM</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Episode Info */}
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeTitle}>
                          {item.episodeNumber}. {item.title}
                        </Text>
                        <Text style={styles.episodeDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                      
                      {/* Play Icon */}
                      <Ionicons name="play-circle-outline" size={30} color={colors.text} />
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noContentText}>No episodes available.</Text>
              )}
            </>
          )}
          
          {/* Details Tab */}
          {activeTab === 'details' && (
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.descriptionText}>{series.description}</Text>
              
              <Text style={styles.sectionTitle}>Director</Text>
              <Text style={styles.infoText}>{series.director || 'Not specified'}</Text>
              
              <Text style={styles.sectionTitle}>Cast</Text>
              <Text style={styles.infoText}>{series.cast?.join(', ') || 'Not specified'}</Text>
              
              <Text style={styles.sectionTitle}>Release Date</Text>
              <Text style={styles.infoText}>
                {new Date(series.releaseDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          {/* Related Tab */}
          {activeTab === 'related' && (
            <View style={styles.relatedContainer}>
              <Text style={styles.noContentText}>
                Related content will be available soon.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
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
  heroContainer: {
    width: width,
    height: height * 0.6,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  ratingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 15,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.premium,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: colors.text,
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  playButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  watchlistButtonText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.inactive,
    marginTop: 10,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 15,
  },
  tabErrorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  episodeImageContainer: {
    position: 'relative',
    width: 120,
    height: 70,
  },
  episodeThumbnail: {
    width: '100%',
    height: '100%',
  },
  episodeDuration: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: colors.text,
    fontSize: 10,
  },
  episodePremiumBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.premium,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  episodePremiumText: {
    color: colors.background,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  episodeInfo: {
    flex: 1,
    padding: 10,
  },
  episodeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  episodeDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  noContentText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  detailsContainer: {
    padding: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  relatedContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default SeriesDetailsScreen;