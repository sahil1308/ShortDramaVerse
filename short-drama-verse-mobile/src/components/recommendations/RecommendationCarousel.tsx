/**
 * Recommendation Carousel Component
 * 
 * This component displays content recommendations in a horizontal scrollable carousel,
 * optimized for mobile viewing with touch interactions.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Recommendation, RecommendationSource } from '@/services/recommendations';
import { DramaSeries, Episode } from '@/types/content';
import { useRecommendations } from '@/hooks/useRecommendations';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEventType } from '@/services/analytics';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Default card width based on screen size
const CARD_WIDTH = width / 2.5;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface RecommendationCarouselProps {
  title: string;
  subtitle?: string;
  source?: RecommendationSource | RecommendationSource[];
  limit?: number;
  seriesData?: DramaSeries[];
  episodeData?: Episode[];
  cardWidth?: number;
  cardHeight?: number;
  showSource?: boolean;
  onSeeAllPress?: () => void;
}

const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  title,
  subtitle,
  source,
  limit = 10,
  seriesData,
  episodeData,
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
  showSource = true,
  onSeeAllPress
}) => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // For manual content data (optional)
  const hasProvidedData = !!(seriesData || episodeData);
  
  // Use recommendations hook if no data is provided
  const {
    recommendations,
    isLoading,
    error,
    refresh
  } = useRecommendations({
    source,
    limit,
    // Only fetch if we don't have provided data
    refreshInterval: hasProvidedData ? undefined : 60000 * 15 // 15 minutes
  });
  
  // Placeholder for content loading
  if (isLoading && !hasProvidedData && recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F72585" />
        </View>
      </View>
    );
  }
  
  // Error state
  if (error && !hasProvidedData && recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-triangle" size={24} color="#F72585" />
          <Text style={styles.errorText}>
            Couldn't load recommendations
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={refresh}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Empty state
  if (
    !isLoading &&
    !hasProvidedData &&
    recommendations.length === 0
  ) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={24} color="#888" />
          <Text style={styles.emptyText}>
            No recommendations found
          </Text>
        </View>
      </View>
    );
  }
  
  // Handle content press
  const handleContentPress = (item: Recommendation | DramaSeries | Episode) => {
    // Track the content selection
    analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
      name: 'recommendation_selected',
      content_id: 'contentId' in item ? item.contentId : item.id,
      content_type: 'contentType' in item ? item.contentType : ('episodes' in item ? 'series' : 'episode'),
      source: 'source' in item ? item.source : 'provided',
      position: activeIndex
    });
    
    // Navigate based on content type
    if ('contentType' in item) {
      // It's a recommendation
      if (item.contentType === 'series') {
        navigation.navigate('SeriesDetail', { id: item.contentId });
      } else {
        navigation.navigate('EpisodePlayer', { id: item.contentId });
      }
    } else if ('episodes' in item) {
      // It's a series
      navigation.navigate('SeriesDetail', { id: item.id });
    } else {
      // It's an episode
      navigation.navigate('EpisodePlayer', { id: item.id });
    }
  };
  
  // Render recommendation card
  const renderItem = ({ item, index }: { 
    item: Recommendation | DramaSeries | Episode; 
    index: number;
  }) => {
    // Get the content title and image based on item type
    let title = '';
    let imageUri = '';
    
    if ('contentId' in item) {
      // It's a recommendation, we need to look up details
      // For now, use placeholder
      title = `Recommended Content ${item.contentId}`;
      imageUri = 'https://via.placeholder.com/300x450';
    } else if ('episodes' in item) {
      // It's a series
      title = item.title;
      imageUri = item.coverImage;
    } else {
      // It's an episode
      title = item.title;
      imageUri = item.thumbnailImage;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { width: cardWidth, height: cardHeight }
        ]}
        onPress={() => handleContentPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          
          {/* Show recommendation source if enabled and it's a recommendation */}
          {showSource && 'source' in item && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                {item.reason || getSourceLabel(item.source)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Helper to get readable source labels
  const getSourceLabel = (source: RecommendationSource): string => {
    switch (source) {
      case RecommendationSource.HISTORY:
        return 'Based on your history';
      case RecommendationSource.PREFERENCE:
        return 'Matches your preferences';
      case RecommendationSource.TRENDING:
        return 'Trending now';
      case RecommendationSource.SIMILAR_CONTENT:
        return 'Similar content';
      case RecommendationSource.SIMILAR_USERS:
        return 'People also watched';
      case RecommendationSource.NEW_RELEASE:
        return 'New release';
      case RecommendationSource.CONTINUE_WATCHING:
        return 'Continue watching';
      default:
        return 'Recommended for you';
    }
  };
  
  // Determine which data to display
  const dataToDisplay = hasProvidedData
    ? (seriesData || episodeData || [])
    : recommendations;
  
  // Return the carousel component
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {onSeeAllPress && (
          <TouchableOpacity 
            style={styles.seeAllButton} 
            onPress={onSeeAllPress}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        ref={flatListRef}
        data={dataToDisplay}
        renderItem={renderItem}
        keyExtractor={(item) => 
          'id' in item 
            ? item.id.toString() 
            : item.contentId.toString() + item.source
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={cardWidth + 10}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.floor(
            event.nativeEvent.contentOffset.x / (cardWidth + 10)
          );
          setActiveIndex(newIndex);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 2,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: '#F72585',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sourceContainer: {
    marginTop: 4,
  },
  sourceText: {
    color: '#CCC',
    fontSize: 12,
  },
  loadingContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F72585',
    borderRadius: 4,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    height: CARD_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  }
});

export default RecommendationCarousel;