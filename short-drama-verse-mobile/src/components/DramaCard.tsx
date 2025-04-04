/**
 * DramaCard Component for ShortDramaVerse Mobile
 * 
 * This component displays drama series or episodes in various layout styles
 * used throughout the application.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Types
import { DramaSeries, Episode } from '@/types/drama';

// Get device width for responsive sizing
const { width } = Dimensions.get('window');

/**
 * Card layout styles
 */
export type CardType = 'default' | 'featured' | 'continue' | 'horizontal';

/**
 * Props for the DramaCard component
 */
interface DramaCardProps {
  item: DramaSeries | Episode;           // Drama series or episode data
  type?: CardType;                       // Card layout style
  onPress: (item: any) => void;          // Item press handler
  index?: number;                        // Item index in list (for sizing)
  numColumns?: number;                   // Number of columns in grid
  showProgress?: boolean;                // Whether to show watch progress
  isEpisode?: boolean;                   // Whether the item is an episode
}

/**
 * Skeleton props for loading state
 */
interface SkeletonProps {
  type: CardType;
  index?: number;
  numColumns?: number;
}

/**
 * DramaCard Skeleton Component
 * 
 * Displays a placeholder loading animation while content is being fetched.
 * 
 * @param props - Skeleton props
 * @returns Skeleton component
 */
export const DramaCardSkeleton: React.FC<SkeletonProps> = ({ 
  type, 
  index = 0,
  numColumns = 2
}) => {
  // Card dimensions based on layout type
  let cardWidth = width * 0.42;
  let cardHeight = cardWidth * 1.5;
  let cardStyle = styles.card;
  
  if (type === 'featured') {
    cardWidth = width - 32;
    cardHeight = width * 0.56;
    cardStyle = styles.featuredCard;
  } else if (type === 'continue') {
    cardWidth = width * 0.65;
    cardHeight = cardWidth * 0.56;
    cardStyle = styles.continueCard;
  } else if (type === 'horizontal') {
    cardWidth = width * 0.33;
    cardHeight = cardWidth * 1.5;
    cardStyle = styles.horizontalCard;
  } else if (numColumns > 0) {
    // Grid layout
    const spacing = 10 * (numColumns - 1);
    const totalPadding = 32;
    cardWidth = (width - spacing - totalPadding) / numColumns;
    cardHeight = cardWidth * 1.5;
  }

  return (
    <View style={[
      cardStyle, 
      { 
        width: cardWidth, 
        height: cardHeight,
        backgroundColor: '#E0E0E0' 
      },
      type === 'default' && { marginLeft: index % numColumns !== 0 ? 10 : 0 }
    ]}>
      <View style={styles.shimmerOverlay}>
        <ActivityIndicator size="small" color="#999999" />
      </View>
    </View>
  );
};

/**
 * DramaCard Component
 * 
 * Displays a drama series or episode card that can be pressed to view details.
 * Supports multiple layout styles: default (grid), featured, continue watching, and horizontal.
 * 
 * @param props - DramaCard props
 * @returns DramaCard component
 */
const DramaCard: React.FC<DramaCardProps> = ({
  item,
  type = 'default',
  onPress,
  index = 0,
  numColumns = 2,
  showProgress = false,
  isEpisode = false
}) => {
  // Determine if item is an episode or series
  const isEpisodeItem = isEpisode || 'seriesId' in item;
  
  // Extract properties based on item type
  const title = isEpisodeItem ? (item as Episode).title : (item as DramaSeries).title;
  const thumbnail = isEpisodeItem ? (item as Episode).thumbnail : (item as DramaSeries).poster;
  const progress = isEpisodeItem ? (item as Episode).watchProgress : undefined;
  
  // Card dimensions based on layout type
  let cardWidth = width * 0.42;
  let cardHeight = cardWidth * 1.5;
  let cardStyle = styles.card;
  
  if (type === 'featured') {
    cardWidth = width - 32;
    cardHeight = width * 0.56;
    cardStyle = styles.featuredCard;
  } else if (type === 'continue') {
    cardWidth = width * 0.65;
    cardHeight = cardWidth * 0.56;
    cardStyle = styles.continueCard;
  } else if (type === 'horizontal') {
    cardWidth = width * 0.33;
    cardHeight = cardWidth * 1.5;
    cardStyle = styles.horizontalCard;
  } else if (numColumns > 0) {
    // Grid layout
    const spacing = 10 * (numColumns - 1);
    const totalPadding = 32;
    cardWidth = (width - spacing - totalPadding) / numColumns;
    cardHeight = cardWidth * 1.5;
  }

  // Calculate progress percentage
  const progressPercentage = (progress && showProgress)
    ? Math.min(Math.max(progress.current / progress.total * 100, 0), 100)
    : 0;
    
  // Render the drama card
  return (
    <TouchableOpacity
      style={[
        cardStyle,
        { width: cardWidth, height: cardHeight },
        type === 'default' && { marginLeft: index % numColumns !== 0 ? 10 : 0 }
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <ImageBackground
        source={{ uri: thumbnail }}
        style={styles.thumbnail}
        imageStyle={{ borderRadius: 8 }}
        resizeMode="cover"
      >
        {type === 'featured' && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.gradient}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {title}
              </Text>
              
              {!(item as DramaSeries).isFree && (
                <View style={styles.premiumBadge}>
                  <MaterialIcons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        )}
        
        {type !== 'featured' && !(item as DramaSeries).isFree && (
          <View style={styles.premiumBadgeSmall}>
            <MaterialIcons name="star" size={10} color="#FFFFFF" />
          </View>
        )}
        
        {type === 'continue' && (
          <View style={styles.continueInfoOverlay}>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.seriesTitle} numberOfLines={1}>
                {(item as Episode).seriesTitle}
              </Text>
            </View>
            <View style={styles.playButton}>
              <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
            </View>
          </View>
        )}
      </ImageBackground>
      
      {type !== 'featured' && type !== 'continue' && (
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          
          {!isEpisodeItem && (
            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>
                {(item as DramaSeries).episodeCount} episodes
              </Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {(item as DramaSeries).rating.toFixed(1)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
      
      {/* Progress bar for continue watching */}
      {showProgress && progressPercentage > 0 && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredCard: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  continueCard: {
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  horizontalCard: {
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    flex: type === 'featured' || type === 'continue' ? 1 : 0.7,
    justifyContent: 'flex-end',
    width: '100%',
    height: undefined,
    aspectRatio: type === 'continue' ? 16/9 : 2/3,
  },
  infoContainer: {
    padding: 8,
    flex: 0.3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 2,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  premiumBadgeSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    padding: 4,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    height: 3,
    width: '100%',
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueInfoOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  episodeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  seriesTitle: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DramaCard;