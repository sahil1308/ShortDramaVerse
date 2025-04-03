import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { DramaSeries } from '@/types/drama';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';
import { getResourceUrl } from '@/services/api';

export type DramaCardSize = 'small' | 'medium' | 'large' | 'featured';
export type DramaCardLayout = 'grid' | 'horizontal' | 'vertical';

interface DramaCardProps {
  series: DramaSeries;
  size?: DramaCardSize;
  layout?: DramaCardLayout;
  showRating?: boolean;
  showTitle?: boolean;
  onPress?: (series: DramaSeries) => void;
  onLongPress?: (series: DramaSeries) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (series: DramaSeries) => void;
}

/**
 * DramaCard component for displaying a drama series
 * Supports different sizes and layouts
 */
const DramaCard: React.FC<DramaCardProps> = ({
  series,
  size = 'medium',
  layout = 'vertical',
  showRating = true,
  showTitle = true,
  onPress,
  onLongPress,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = Dimensions.get('window');

  // Calculate card dimensions based on size and layout
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return layout === 'horizontal' 
          ? { width: width * 0.3, height: 100 } 
          : { width: width * 0.3, height: 160 };
      case 'medium':
        return layout === 'horizontal' 
          ? { width: width * 0.45, height: 120 } 
          : { width: width * 0.4, height: 220 };
      case 'large':
        return layout === 'horizontal' 
          ? { width: width * 0.6, height: 140 } 
          : { width: width * 0.5, height: 280 };
      case 'featured':
        return layout === 'horizontal' 
          ? { width: width * 0.9, height: 180 } 
          : { width: width - 32, height: 200 };
    }
  };

  const dimensions = getCardDimensions();

  // Determine font size based on card size
  const getTitleFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      case 'featured':
        return 18;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(series);
    } else {
      navigation.navigate('SeriesDetails', { id: series.id });
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(series);
    }
  };

  const handleWatchlistToggle = (e: any) => {
    e.stopPropagation();
    if (onToggleWatchlist) {
      onToggleWatchlist(series);
    }
  };

  const renderHorizontalLayout = () => {
    return (
      <TouchableOpacity
        style={[styles.horizontalContainer, { width: dimensions.width, height: dimensions.height }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: getResourceUrl(series.coverImage) }}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        <View style={styles.horizontalContent}>
          {showTitle && (
            <Text style={[styles.title, { fontSize: getTitleFontSize() }]} numberOfLines={2}>
              {series.title}
            </Text>
          )}
          {showRating && series.averageRating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{series.averageRating.toFixed(1)}</Text>
            </View>
          )}
          {size !== 'small' && (
            <Text style={styles.info} numberOfLines={1}>
              {series.releaseYear} • {series.genre[0]}
            </Text>
          )}
          {(size === 'large' || size === 'featured') && (
            <Text style={styles.description} numberOfLines={2}>
              {series.description}
            </Text>
          )}
        </View>
        {onToggleWatchlist && (
          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={handleWatchlistToggle}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialIcons 
              name={isInWatchlist ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isInWatchlist ? "#E50914" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderVerticalLayout = () => {
    return (
      <TouchableOpacity
        style={[styles.verticalContainer, { width: dimensions.width }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getResourceUrl(series.coverImage) }}
            style={[styles.verticalImage, { height: dimensions.height * 0.75 }]}
            resizeMode="cover"
          />
          {series.isExclusive && (
            <View style={styles.exclusiveBadge}>
              <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
            </View>
          )}
          {onToggleWatchlist && (
            <TouchableOpacity
              style={styles.watchlistButton}
              onPress={handleWatchlistToggle}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialIcons 
                name={isInWatchlist ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isInWatchlist ? "#E50914" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.verticalContent}>
          {showTitle && (
            <Text style={[styles.title, { fontSize: getTitleFontSize() }]} numberOfLines={2}>
              {series.title}
            </Text>
          )}
          <View style={styles.infoRow}>
            {showRating && series.averageRating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.rating}>{series.averageRating.toFixed(1)}</Text>
              </View>
            )}
            {size !== 'small' && (
              <Text style={styles.info} numberOfLines={1}>
                {series.releaseYear} • {series.genre[0]}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout();
};

const styles = StyleSheet.create({
  // Horizontal layout styles
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  horizontalImage: {
    width: '40%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  
  // Vertical layout styles
  verticalContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  verticalImage: {
    width: '100%',
    borderRadius: 8,
  },
  verticalContent: {
    padding: 8,
    paddingBottom: 12,
  },
  
  // Shared styles
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  rating: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  info: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exclusiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  watchlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
});

export default DramaCard;