import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, DramaSeries } from '@/types/drama';

type SeriesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SeriesDetails'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 15;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// Different card styles
const CARD_TYPES = {
  DEFAULT: 'default',
  FEATURED: 'featured',
  CONTINUE: 'continue',
  HORIZONTAL: 'horizontal',
  MINIMAL: 'minimal',
};

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x450/EEEEEE/999999?text=No+Image';

interface DramaCardProps {
  series: DramaSeries;
  onPress?: () => void;
  style?: 'default' | 'featured' | 'continue' | 'horizontal' | 'minimal';
  progress?: number;
  showBadge?: boolean;
  isInWatchlist?: boolean;
}

/**
 * A reusable card component to display drama series information
 * with different styles based on where it's used in the app
 */
const DramaCard: React.FC<DramaCardProps> = ({
  series,
  onPress,
  style = CARD_TYPES.DEFAULT,
  progress = 0,
  showBadge = false,
  isInWatchlist = false,
}) => {
  const navigation = useNavigation<SeriesNavigationProp>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('SeriesDetails', { seriesId: series.id });
    }
  };

  // Render different card types
  if (style === CARD_TYPES.FEATURED) {
    // Featured card - larger with more detail
    return (
      <TouchableOpacity onPress={handlePress} style={styles.featuredCard}>
        <ImageBackground
          source={{ uri: series.coverImage || DEFAULT_IMAGE }}
          style={styles.featuredImage}
          imageStyle={{ borderRadius: 8 }}
        >
          <View style={styles.featuredGradient}>
            {isInWatchlist && (
              <View style={styles.watchlistBadge}>
                <MaterialIcons name="bookmark" size={18} color="#fff" />
              </View>
            )}
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{series.title}</Text>
              <View style={styles.featuredMeta}>
                <Text style={styles.featuredYear}>{series.releaseYear}</Text>
                <Text style={styles.featuredDot}>•</Text>
                <Text style={styles.featuredEpisodes}>
                  {series.totalEpisodes} Episodes
                </Text>
                {series.averageRating && (
                  <>
                    <Text style={styles.featuredDot}>•</Text>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.featuredRating}>
                      {series.averageRating.toFixed(1)}
                    </Text>
                  </>
                )}
              </View>
              <Text numberOfLines={2} style={styles.featuredDescription}>
                {series.description}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  if (style === CARD_TYPES.CONTINUE) {
    // Continue watching card with progress bar
    return (
      <TouchableOpacity onPress={handlePress} style={styles.continueCard}>
        <Image
          source={{ uri: series.coverImage || DEFAULT_IMAGE }}
          style={styles.continueImage}
        />
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${progress}%` }]}
          />
        </View>
        <View style={styles.continueContent}>
          <Text numberOfLines={1} style={styles.continueTitle}>
            {series.title}
          </Text>
          <Text numberOfLines={1} style={styles.continueInfo}>
            Continue Episode 3
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (style === CARD_TYPES.HORIZONTAL) {
    // Horizontal card for lists
    return (
      <TouchableOpacity onPress={handlePress} style={styles.horizontalCard}>
        <Image
          source={{ uri: series.coverImage || DEFAULT_IMAGE }}
          style={styles.horizontalImage}
        />
        <View style={styles.horizontalContent}>
          <Text numberOfLines={1} style={styles.horizontalTitle}>
            {series.title}
          </Text>
          <Text numberOfLines={1} style={styles.horizontalInfo}>
            {series.releaseYear} • {series.totalEpisodes} Episodes
          </Text>
          <Text numberOfLines={2} style={styles.horizontalDescription}>
            {series.description}
          </Text>
          {series.averageRating && (
            <View style={styles.horizontalRating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>
                {series.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        {isInWatchlist && (
          <View style={styles.horizontalWatchlistBadge}>
            <MaterialIcons name="bookmark" size={16} color="#FF6B6B" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Default card style
  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image
        source={{ uri: series.coverImage || DEFAULT_IMAGE }}
        style={styles.image}
      />
      {showBadge && series.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
      )}
      {isInWatchlist && (
        <View style={styles.bookmarkBadge}>
          <MaterialIcons name="bookmark" size={16} color="#fff" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text numberOfLines={1} style={styles.title}>
          {series.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.year}>{series.releaseYear}</Text>
          {series.averageRating && (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>
                {series.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  card: {
    width: CARD_WIDTH,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: CARD_HEIGHT - 50,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardContent: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  year: {
    fontSize: 12,
    color: '#666',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 4,
  },

  // Featured card styles
  featuredCard: {
    width: width - 30,
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featuredYear: {
    fontSize: 12,
    color: '#eee',
  },
  featuredDot: {
    fontSize: 12,
    color: '#eee',
    marginHorizontal: 4,
  },
  featuredEpisodes: {
    fontSize: 12,
    color: '#eee',
  },
  featuredRating: {
    fontSize: 12,
    color: '#eee',
    marginLeft: 2,
  },
  featuredDescription: {
    fontSize: 12,
    color: '#ddd',
  },
  watchlistBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 4,
  },

  // Continue watching card styles
  continueCard: {
    width: 140,
    height: 180,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  continueImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  progressContainer: {
    height: 3,
    width: '100%',
    backgroundColor: '#E0E0E0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  continueContent: {
    padding: 8,
  },
  continueTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  continueInfo: {
    fontSize: 11,
    color: '#666',
  },

  // Horizontal card styles
  horizontalCard: {
    flexDirection: 'row',
    width: '100%',
    height: 100,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  horizontalImage: {
    width: 70,
    height: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  horizontalContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  horizontalInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  horizontalDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  horizontalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalWatchlistBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default DramaCard;