import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useContent } from '../../hooks/useContent';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { DramaCard } from '../../components/DramaCard';
import { EmptyStateView } from '../../components/EmptyStateView';
import { Drama } from '../../types/drama';

interface SearchScreenProps {
  navigation: any;
}

const SEARCH_FILTERS = [
  { id: 'all', label: 'All', key: 'all' },
  { id: 'title', label: 'Title', key: 'title' },
  { id: 'genre', label: 'Genre', key: 'genre' },
  { id: 'actor', label: 'Actor', key: 'actor' },
  { id: 'year', label: 'Year', key: 'year' },
];

const POPULAR_SEARCHES = [
  'Romance', 'Comedy', 'Action', 'Historical', 'Fantasy',
  'New Release', 'Trending', 'Popular', 'Top Rated'
];

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Drama[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  
  const { 
    searchDramas, 
    searchDramasByTitle, 
    searchDramasByGenre, 
    searchDramasByActor,
    getPopularDramas,
    getTrendingDramas 
  } = useContent();
  const { trackEvent } = useAnalytics();
  const { preferences } = useUserPreferences();
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadRecentSearches();
    loadPopularContent();
    
    // Focus on search input when screen loads
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  useEffect(() => {
    // Auto-search with debounce
    if (searchQuery.trim() !== '') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSuggestions(true);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedFilter]);

  const loadRecentSearches = async () => {
    try {
      // In a real app, this would load from AsyncStorage
      // For now, using mock data
      const mockRecentSearches = ['Romance', 'Comedy', 'Action'];
      setRecentSearches(mockRecentSearches);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const loadPopularContent = async () => {
    try {
      const popular = await getPopularDramas();
      if (searchQuery.trim() === '') {
        setSearchResults(popular.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to load popular content:', error);
    }
  };

  const performSearch = async (query: string) => {
    if (query.trim() === '') return;

    try {
      setLoading(true);
      setShowSuggestions(false);
      
      let results: Drama[] = [];
      
      switch (selectedFilter) {
        case 'title':
          results = await searchDramasByTitle(query);
          break;
        case 'genre':
          results = await searchDramasByGenre(query);
          break;
        case 'actor':
          results = await searchDramasByActor(query);
          break;
        case 'year':
          results = await searchDramas(query); // Generic search for year
          break;
        default:
          results = await searchDramas(query);
      }
      
      setSearchResults(results);
      await saveRecentSearch(query);
      
      trackEvent('search_performed', {
        query: query,
        filter: selectedFilter,
        results_count: results.length,
        has_results: results.length > 0
      });
      
    } catch (error) {
      Alert.alert('Error', 'Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const updatedRecentSearches = [
        query,
        ...recentSearches.filter(item => item !== query)
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updatedRecentSearches);
      // In a real app, save to AsyncStorage
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery);
    }
  };

  const handlePopularSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    setShowSuggestions(false);
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    // In a real app, clear from AsyncStorage
  };

  const handleDramaPress = (drama: Drama) => {
    trackEvent('search_result_selected', {
      drama_id: drama.id,
      drama_title: drama.title,
      search_query: searchQuery,
      filter: selectedFilter
    });
    navigation.navigate('SeriesDetail', { drama });
  };

  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.selectedFilterButton
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter.id && styles.selectedFilterButtonText
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSuggestions = () => (
    <ScrollView style={styles.suggestionsContainer}>
      {/* Popular Searches */}
      <View style={styles.suggestionSection}>
        <Text style={styles.sectionTitle}>Popular Searches</Text>
        <View style={styles.tagContainer}>
          {POPULAR_SEARCHES.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tagButton}
              onPress={() => handlePopularSearchPress(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.suggestionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentSearchContainer}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearchPress(search)}
              >
                <Text style={styles.recentSearchText}>🕐 {search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Trending Content */}
      <View style={styles.suggestionSection}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <Text style={styles.sectionSubtitle}>
          Discover what's popular right now
        </Text>
      </View>
    </ScrollView>
  );

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && !showSuggestions) {
      return (
        <EmptyStateView
          message="No results found"
          subMessage={`Try searching for "${searchQuery}" with different filters`}
        />
      );
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <DramaCard
            drama={item}
            onPress={() => handleDramaPress(item)}
            style={styles.dramaCard}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search dramas, actors, genres..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => {
              setSearchQuery('');
              setShowSuggestions(true);
            }}
          >
            <Text style={styles.clearSearchText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {SEARCH_FILTERS.map(renderFilterButton)}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentContainer}>
        {showSuggestions ? renderSuggestions() : renderSearchResults()}
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 24,
    padding: 8,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: '#111',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  selectedFilterButton: {
    backgroundColor: '#ff6b6b',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedFilterButtonText: {
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
  suggestionSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ccc',
  },
  clearButton: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  recentSearchContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 8,
  },
  recentSearchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  recentSearchText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
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
});