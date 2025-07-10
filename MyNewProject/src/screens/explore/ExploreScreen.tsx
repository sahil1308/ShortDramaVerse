import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useContent } from '../../hooks/useContent';
import { useAnalytics } from '../../hooks/useAnalytics';
import { DramaCard } from '../../components/DramaCard';
import { EmptyStateView } from '../../components/EmptyStateView';
import { DramaSeries } from '../../types/drama';

interface ExploreScreenProps {
  navigation: any;
}

const GENRES = [
  'Romance', 'Comedy', 'Drama', 'Thriller', 'Action', 'Fantasy', 'Historical', 'Mystery'
];

const TRENDING_TAGS = [
  'Trending', 'New Release', 'Popular', 'Recommended', 'Top Rated'
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const { 
    getDramasByGenre, 
    getTrendingDramas, 
    getNewReleases, 
    searchDramas 
  } = useContent();
  const { trackEvent } = useAnalytics();

  const [dramas, setDramas] = useState<DramaSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadDramas();
  }, [selectedGenre]);

  const loadDramas = async () => {
    try {
      setLoading(true);
      let result: DramaSeries[] = [];
      
      if (selectedGenre === 'All') {
        result = await getTrendingDramas();
      } else {
        result = await getDramasByGenre(selectedGenre);
      }
      
      setDramas(result);
      trackEvent('explore_content_viewed', {
        genre: selectedGenre,
        count: result.length
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load dramas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      loadDramas();
      return;
    }
    
    try {
      setLoading(true);
      const results = await searchDramas(query);
      setDramas(results);
      trackEvent('explore_search', {
        query: query,
        results_count: results.length
      });
    } catch (error) {
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDramas();
    setRefreshing(false);
  };

  const handleDramaPress = (drama: DramaSeries) => {
    trackEvent('explore_drama_selected', {
      drama_id: drama.id,
      drama_title: drama.title,
      genre: drama.genre
    });
    navigation.navigate('SeriesDetail', { drama });
  };

  const renderGenreFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.genreScrollView}
      contentContainerStyle={styles.genreContainer}
    >
      <TouchableOpacity
        style={[
          styles.genreButton,
          selectedGenre === 'All' && styles.selectedGenreButton
        ]}
        onPress={() => setSelectedGenre('All')}
      >
        <Text style={[
          styles.genreButtonText,
          selectedGenre === 'All' && styles.selectedGenreButtonText
        ]}>
          All
        </Text>
      </TouchableOpacity>
      {GENRES.map((genre) => (
        <TouchableOpacity
          key={genre}
          style={[
            styles.genreButton,
            selectedGenre === genre && styles.selectedGenreButton
          ]}
          onPress={() => setSelectedGenre(genre)}
        >
          <Text style={[
            styles.genreButtonText,
            selectedGenre === genre && styles.selectedGenreButtonText
          ]}>
            {genre}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search dramas..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => handleSearch(searchQuery)}
        returnKeyType="search"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => handleSearch(searchQuery)}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDramaItem = ({ item }: { item: DramaSeries }) => (
    <DramaCard
      drama={item}
      onPress={() => handleDramaPress(item)}
      style={styles.dramaCard}
    />
  );

  if (loading && dramas.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <TouchableOpacity
            style={styles.searchToggle}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Text style={styles.searchToggleText}>🔍</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dramas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity
          style={styles.searchToggle}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Text style={styles.searchToggleText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {showSearch && renderSearchBar()}
      {renderGenreFilter()}

      <FlatList
        data={dramas}
        renderItem={renderDramaItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyStateView
            message="No dramas found"
            subMessage="Try adjusting your search or genre filter"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchToggle: {
    padding: 8,
  },
  searchToggleText: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  genreScrollView: {
    backgroundColor: '#111',
  },
  genreContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  genreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  selectedGenreButton: {
    backgroundColor: '#ff6b6b',
  },
  genreButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedGenreButtonText: {
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  dramaCard: {
    width: '48%',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});