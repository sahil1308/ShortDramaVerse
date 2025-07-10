/**
 * Genre Preferences Component
 * 
 * This component allows users to select their favorite and disliked genres
 * to improve content recommendations.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { userPreferencesService } from '@/services/userPreferences';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEventType } from '@/services/analytics';

// Available genres for user selection
const AVAILABLE_GENRES = [
  'Romance', 'Mystery', 'Drama', 'Comedy', 'Thriller', 
  'Action', 'Fantasy', 'Historical', 'Slice of Life', 'Melodrama',
  'Horror', 'Sci-Fi', 'Crime', 'Adventure', 'Family',
  'School', 'Medical', 'Legal', 'Political', 'Musical',
  'Supernatural', 'Military', 'Sports', 'Psychological', 'Period'
];

interface GenrePreferencesProps {
  onUpdate?: () => void;
}

const GenrePreferences: React.FC<GenrePreferencesProps> = ({ onUpdate }) => {
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [dislikedGenres, setDislikedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const preferences = await userPreferencesService.getContentPreferences();
        setFavoriteGenres(preferences.favoriteGenres);
        setDislikedGenres(preferences.dislikedGenres);
      } catch (error) {
        console.error('Error loading genre preferences:', error);
        Alert.alert(
          'Error',
          'Failed to load your genre preferences. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Toggle genre status (favorite, disliked, or neutral)
  const toggleGenreStatus = async (genre: string) => {
    try {
      setIsSaving(true);
      
      if (favoriteGenres.includes(genre)) {
        // Remove from favorites
        await userPreferencesService.removeFavoriteGenre(genre);
        setFavoriteGenres(prev => prev.filter(g => g !== genre));
      } else if (dislikedGenres.includes(genre)) {
        // Remove from disliked
        await userPreferencesService.removeDislikedGenre(genre);
        setDislikedGenres(prev => prev.filter(g => g !== genre));
      } else {
        // Add to favorites
        await userPreferencesService.addFavoriteGenre(genre);
        setFavoriteGenres(prev => [...prev, genre]);
      }
      
      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }
      
      // Track preference change
      analyticsService.trackEvent(AnalyticsEventType.SETTING_CHANGE, {
        category: 'genre_preference',
        genre,
        action: favoriteGenres.includes(genre) ? 'remove_favorite' : 
                dislikedGenres.includes(genre) ? 'remove_dislike' : 'add_favorite'
      });
    } catch (error) {
      console.error('Error updating genre preference:', error);
      Alert.alert(
        'Error',
        'Failed to update your genre preference. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle dislike status
  const toggleDislikeStatus = async (genre: string) => {
    try {
      setIsSaving(true);
      
      if (dislikedGenres.includes(genre)) {
        // Remove from disliked
        await userPreferencesService.removeDislikedGenre(genre);
        setDislikedGenres(prev => prev.filter(g => g !== genre));
      } else {
        // Add to disliked
        await userPreferencesService.addDislikedGenre(genre);
        setDislikedGenres(prev => [...prev, genre]);
        
        // Remove from favorites if it's there
        if (favoriteGenres.includes(genre)) {
          await userPreferencesService.removeFavoriteGenre(genre);
          setFavoriteGenres(prev => prev.filter(g => g !== genre));
        }
      }
      
      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }
      
      // Track preference change
      analyticsService.trackEvent(AnalyticsEventType.SETTING_CHANGE, {
        category: 'genre_preference',
        genre,
        action: dislikedGenres.includes(genre) ? 'remove_dislike' : 'add_dislike'
      });
    } catch (error) {
      console.error('Error updating genre preference:', error);
      Alert.alert(
        'Error',
        'Failed to update your genre preference. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset all preferences
  const resetPreferences = async () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all your genre preferences?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await userPreferencesService.updateContentPreferences({
                favoriteGenres: [],
                dislikedGenres: []
              });
              
              setFavoriteGenres([]);
              setDislikedGenres([]);
              
              // Notify parent component
              if (onUpdate) {
                onUpdate();
              }
              
              // Track reset
              analyticsService.trackEvent(AnalyticsEventType.SETTING_CHANGE, {
                category: 'genre_preference',
                action: 'reset_all'
              });
            } catch (error) {
              console.error('Error resetting preferences:', error);
              Alert.alert(
                'Error',
                'Failed to reset your preferences. Please try again.'
              );
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };
  
  // Render genre item
  const renderGenreItem = ({ item }: { item: string }) => {
    const isFavorite = favoriteGenres.includes(item);
    const isDisliked = dislikedGenres.includes(item);
    
    return (
      <View style={styles.genreItem}>
        <Text style={styles.genreName}>{item}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isFavorite ? styles.favoriteActive : null
            ]}
            onPress={() => toggleGenreStatus(item)}
            disabled={isSaving}
          >
            <Feather
              name="thumbs-up"
              size={18}
              color={isFavorite ? '#fff' : '#ccc'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDisliked ? styles.dislikedActive : null
            ]}
            onPress={() => toggleDislikeStatus(item)}
            disabled={isSaving}
          >
            <Feather
              name="thumbs-down"
              size={18}
              color={isDisliked ? '#fff' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F72585" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Genre Preferences</Text>
        <Text style={styles.subtitle}>
          Set your genre preferences to get personalized recommendations
        </Text>
      </View>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>
          <Feather name="thumbs-up" size={14} color="#4CC9F0" /> Like genres you enjoy
        </Text>
        <Text style={styles.instructions}>
          <Feather name="thumbs-down" size={14} color="#F72585" /> Dislike genres you want to avoid
        </Text>
      </View>
      
      {favoriteGenres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Favorite Genres</Text>
          <View style={styles.tagsContainer}>
            {favoriteGenres.map(genre => (
              <TouchableOpacity
                key={genre}
                style={styles.favoriteTag}
                onPress={() => toggleGenreStatus(genre)}
                disabled={isSaving}
              >
                <Text style={styles.favoriteTagText}>{genre}</Text>
                <Feather name="x" size={14} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {dislikedGenres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres You Dislike</Text>
          <View style={styles.tagsContainer}>
            {dislikedGenres.map(genre => (
              <TouchableOpacity
                key={genre}
                style={styles.dislikedTag}
                onPress={() => toggleDislikeStatus(genre)}
                disabled={isSaving}
              >
                <Text style={styles.dislikedTagText}>{genre}</Text>
                <Feather name="x" size={14} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.allGenresSection}>
        <Text style={styles.sectionTitle}>All Genres</Text>
        <FlatList
          data={AVAILABLE_GENRES}
          renderItem={renderGenreItem}
          keyExtractor={item => item}
          style={styles.genreList}
          contentContainerStyle={styles.genreListContent}
        />
      </View>
      
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetPreferences}
        disabled={isSaving || (favoriteGenres.length === 0 && dislikedGenres.length === 0)}
      >
        <Feather name="refresh-cw" size={16} color="#fff" />
        <Text style={styles.resetButtonText}>Reset Preferences</Text>
      </TouchableOpacity>
      
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#F72585" />
          <Text style={styles.savingText}>Saving preferences...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
  },
  instructionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#ddd',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  favoriteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4361EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  favoriteTagText: {
    color: '#fff',
    marginRight: 4,
  },
  dislikedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F72585',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  dislikedTagText: {
    color: '#fff',
    marginRight: 4,
  },
  allGenresSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  genreList: {
    flex: 1,
  },
  genreListContent: {
    paddingBottom: 16,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  genreName: {
    fontSize: 16,
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  favoriteActive: {
    backgroundColor: '#4361EE',
    borderColor: '#4361EE',
  },
  dislikedActive: {
    backgroundColor: '#F72585',
    borderColor: '#F72585',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ccc',
    marginTop: 8,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    color: '#fff',
    marginTop: 8,
  }
});

export default GenrePreferences;