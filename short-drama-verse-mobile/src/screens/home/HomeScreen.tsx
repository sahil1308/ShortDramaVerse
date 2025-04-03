import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/services/api';
import { DramaSeries } from '@/types/drama';
import DramaCard from '@/components/DramaCard';
import LoadingScreen from '@/screens/common/LoadingScreen';
import { StatusBar } from 'expo-status-bar';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Colors
const colors = {
  primary: '#E50914',
  background: '#121212',
  cardBg: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch all drama series
  const { data: allSeries, isLoading, error, refetch } = useQuery({
    queryKey: ['dramaSeriesList'],
    queryFn: () => api.get<DramaSeries[]>(endpoints.dramaSeries.all),
  });
  
  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  
  // Create categories from data
  const categories = React.useMemo(() => {
    if (!allSeries) return {};
    
    // Create categories based on genre
    const genreCategories = allSeries.reduce((acc, series) => {
      series.genre.forEach(genre => {
        if (!acc[genre]) acc[genre] = [];
        acc[genre].push(series);
      });
      return acc;
    }, {} as Record<string, DramaSeries[]>);
    
    // Add trending and recent categories
    const trending = [...allSeries].sort((a, b) => b.averageRating - a.averageRating).slice(0, 10);
    const recent = [...allSeries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);
    
    return {
      'Trending Now': trending,
      'Recently Added': recent,
      ...genreCategories,
    };
  }, [allSeries]);
  
  // Navigate to drama series details
  const navigateToSeriesDetails = (seriesId: number) => {
    navigation.navigate('SeriesDetails', { seriesId });
  };
  
  if (isLoading && !refreshing) {
    return <LoadingScreen message="Loading content..." />;
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading content. Please try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Featured Content */}
        {allSeries && allSeries.length > 0 && (
          <View style={styles.featuredContainer}>
            <Image
              source={{ uri: allSeries[0].coverImage }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>{allSeries[0].title}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {allSeries[0].description}
              </Text>
              <TouchableOpacity
                style={styles.watchButton}
                onPress={() => navigateToSeriesDetails(allSeries[0].id)}
              >
                <Text style={styles.watchButtonText}>Watch Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Categories */}
        {Object.entries(categories).map(([title, seriesList], index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <FlatList
              data={seriesList}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <DramaCard
                  series={item}
                  onPress={() => navigateToSeriesDetails(item.id)}
                />
              )}
              contentContainerStyle={styles.dramaCardList}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: RNStatusBar.currentHeight,
  },
  scrollView: {
    flex: 1,
  },
  featuredContainer: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
  },
  watchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  watchButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
  dramaCardList: {
    paddingLeft: 10,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;