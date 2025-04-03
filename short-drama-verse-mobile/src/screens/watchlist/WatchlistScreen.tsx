import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, WatchlistWithSeries } from '@/types/drama';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/screens/common/LoadingScreen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import EmptyStateView from '@/components/EmptyStateView';

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
  success: '#4CAF50',
  danger: '#F44336',
};

type WatchlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WatchlistScreen = () => {
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch user's watchlist
  const {
    data: watchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
    refetch: refetchWatchlist,
  } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get<WatchlistWithSeries[]>(endpoints.watchlist.getAll),
    enabled: !!user,
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: (seriesId: number) => api.delete(`${endpoints.watchlist.remove(seriesId)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['dramaSeries'] });
    },
    onError: (error) => {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'Failed to remove from watchlist. Please try again.');
    },
  });
  
  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchWatchlist();
    setRefreshing(false);
  }, [refetchWatchlist]);
  
  // Navigate to series details
  const navigateToSeries = (seriesId: number) => {
    navigation.navigate('SeriesDetails', { seriesId });
  };
  
  // Remove from watchlist
  const handleRemoveFromWatchlist = (seriesId: number) => {
    Alert.alert(
      'Remove from Watchlist',
      'Are you sure you want to remove this series from your watchlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWatchlistMutation.mutate(seriesId),
        },
      ]
    );
  };
  
  // Loading state
  if (isWatchlistLoading) {
    return <LoadingScreen message="Loading your watchlist..." />;
  }
  
  // Error state
  if (watchlistError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading your watchlist.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Empty state
  if (!watchlist || watchlist.length === 0) {
    return (
      <EmptyStateView
        icon="bookmark-outline"
        title="Your Watchlist is Empty"
        message="Drama series you save will appear here. Browse and add your favorites!"
        actionText="Browse Series"
        onActionPress={() => navigation.navigate('Home')}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Watchlist</Text>
        {watchlist && watchlist.length > 0 && (
          <Text style={styles.headerCount}>{watchlist.length} Series</Text>
        )}
      </View>
      
      {/* Watchlist content */}
      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <WatchlistItem
            item={item}
            onPress={() => navigateToSeries(item.series.id)}
            onRemove={() => handleRemoveFromWatchlist(item.series.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      />
    </View>
  );
};

// Watchlist item component
interface WatchlistItemProps {
  item: WatchlistWithSeries;
  onPress: () => void;
  onRemove: () => void;
}

const WatchlistItem = ({ item, onPress, onRemove }: WatchlistItemProps) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Image
        source={{ uri: item.series.coverImage }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemContent}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.series.title}
          </Text>
          <View style={styles.itemMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={14} color={colors.primary} style={styles.metaIcon} />
              <Text style={styles.metaText}>
                {item.series.averageRating?.toFixed(1) || 'N/A'} • {item.series.releaseYear}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="film-outline" size={14} color={colors.textSecondary} style={styles.metaIcon} />
              <Text style={styles.metaText}>
                {item.series.episodeCount || '?'} Episodes
              </Text>
            </View>
            <View style={styles.genreContainer}>
              {item.series.genre.split(',').slice(0, 2).map((genre, index) => (
                <View key={index} style={styles.genreBadge}>
                  <Text style={styles.genreText}>{genre.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 100,
    height: 140,
  },
  itemContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  itemMeta: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  genreBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  genreText: {
    fontSize: 10,
    color: colors.primary,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
  },
});

export default WatchlistScreen;