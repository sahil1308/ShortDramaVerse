import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { DramaSeries, Advertisement } from '@/types/drama';
import DramaCard from '@/components/DramaCard';
import LoadingScreen from '@/screens/common/LoadingScreen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  premium: '#FFD700',
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Trending', 'New Releases', 'Romance', 'Comedy', 'Drama', 'Thriller']);
  
  // Featured content query
  const {
    data: featuredSeries,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ['dramaSeries', 'featured'],
    queryFn: () => api.get<DramaSeries[]>(`${endpoints.dramaSeries.all}?featured=true&limit=1`),
  });
  
  // New releases query
  const {
    data: newReleases,
    isLoading: isNewReleasesLoading,
    error: newReleasesError,
    refetch: refetchNewReleases,
  } = useQuery({
    queryKey: ['dramaSeries', 'newReleases'],
    queryFn: () => api.get<DramaSeries[]>(`${endpoints.dramaSeries.all}?sort=releaseDate&order=desc&limit=10`),
  });
  
  // Trending series query
  const {
    data: trendingSeries,
    isLoading: isTrendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ['dramaSeries', 'trending'],
    queryFn: () => api.get<DramaSeries[]>(`${endpoints.dramaSeries.all}?sort=viewCount&order=desc&limit=10`),
  });
  
  // Popular romance series query
  const {
    data: romanceSeries,
    isLoading: isRomanceLoading,
    error: romanceError,
    refetch: refetchRomance,
  } = useQuery({
    queryKey: ['dramaSeries', 'romance'],
    queryFn: () => api.get<DramaSeries[]>(`${endpoints.dramaSeries.byGenre('romance')}?limit=10`),
  });
  
  // Popular comedy series query
  const {
    data: comedySeries,
    isLoading: isComedyLoading,
    error: comedyError,
    refetch: refetchComedy,
  } = useQuery({
    queryKey: ['dramaSeries', 'comedy'],
    queryFn: () => api.get<DramaSeries[]>(`${endpoints.dramaSeries.byGenre('comedy')}?limit=10`),
  });
  
  // Banner ads query
  const {
    data: bannerAds,
    isLoading: isAdsLoading,
    error: adsError,
    refetch: refetchAds,
  } = useQuery({
    queryKey: ['advertisements', 'home-banner'],
    queryFn: () => api.get<Advertisement[]>(`${endpoints.advertisements.active('home-banner')}`),
  });
  
  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchFeatured(),
      refetchNewReleases(),
      refetchTrending(),
      refetchRomance(),
      refetchComedy(),
      refetchAds(),
    ]);
    setRefreshing(false);
  }, [refetchFeatured, refetchNewReleases, refetchTrending, refetchRomance, refetchComedy, refetchAds]);
  
  // Navigate to series details
  const navigateToSeries = (seriesId: number) => {
    navigation.navigate('SeriesDetails', { seriesId });
  };
  
  // Handle ad click
  const handleAdClick = async (ad: Advertisement) => {
    try {
      await api.post(`${endpoints.advertisements.click(ad.id)}`);
      // Open ad URL if needed
    } catch (error) {
      console.error('Error registering ad click:', error);
    }
  };
  
  // Loading state
  if (
    isFeaturedLoading ||
    isNewReleasesLoading ||
    isTrendingLoading ||
    isRomanceLoading ||
    isComedyLoading
  ) {
    return <LoadingScreen message="Loading content..." />;
  }
  
  // Error state
  if (
    featuredError ||
    newReleasesError ||
    trendingError ||
    romanceError ||
    comedyError
  ) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading content.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        {/* Greeting and App Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.displayName || user.username}` : 'Welcome'}
            </Text>
            <Text style={styles.subtitle}>Discover short drama series</Text>
          </View>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('UserProfile')}
          >
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.username?.charAt(0).toUpperCase() || 'G'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Featured Content Banner */}
        {featuredSeries && featuredSeries.length > 0 && (
          <TouchableOpacity
            style={styles.featuredContainer}
            onPress={() => navigateToSeries(featuredSeries[0].id)}
          >
            <Image
              source={{ uri: featuredSeries[0].coverImage }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.featuredGradient}
            />
            <View style={styles.featuredContent}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FEATURED</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredSeries[0].title}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {featuredSeries[0].description}
              </Text>
              <TouchableOpacity
                style={styles.watchButton}
                onPress={() => navigateToSeries(featuredSeries[0].id)}
              >
                <Ionicons name="play" size={16} color={colors.text} />
                <Text style={styles.watchButtonText}>Watch Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Category Sections */}
        {trendingSeries && trendingSeries.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={trendingSeries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DramaCard series={item} onPress={() => navigateToSeries(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          </View>
        )}
        
        {/* Advertisement Banner */}
        {bannerAds && bannerAds.length > 0 && (
          <TouchableOpacity
            style={styles.adContainer}
            onPress={() => handleAdClick(bannerAds[0])}
          >
            <Image
              source={{ uri: bannerAds[0].imageUrl }}
              style={styles.adBanner}
              resizeMode="cover"
            />
            <View style={styles.adOverlay}>
              <Text style={styles.adLabel}>Ad</Text>
              <Text style={styles.adTitle}>{bannerAds[0].title}</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {/* New Releases Section */}
        {newReleases && newReleases.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Releases</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={newReleases}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DramaCard series={item} onPress={() => navigateToSeries(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          </View>
        )}
        
        {/* Romance Section */}
        {romanceSeries && romanceSeries.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Romance</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={romanceSeries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DramaCard series={item} onPress={() => navigateToSeries(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          </View>
        )}
        
        {/* Comedy Section */}
        {comedySeries && comedySeries.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comedy</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={comedySeries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DramaCard series={item} onPress={() => navigateToSeries(item.id)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            />
          </View>
        )}
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
  scrollView: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
  },
  greeting: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.cardBg,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
  },
  profileInitial: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuredContainer: {
    width: width,
    height: height * 0.3,
    marginBottom: 20,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  featuredBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  carouselContainer: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  adContainer: {
    marginHorizontal: 15,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 25,
    position: 'relative',
  },
  adBanner: {
    width: '100%',
    height: '100%',
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  adLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.7,
    marginBottom: 2,
  },
  adTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;