import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Platform,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { DramaSeries } from '@/types/drama';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';

// Get window dimensions for responsive sizing
const { width } = Dimensions.get('window');

// Different card variants
export type DramaCardVariant = 'horizontal' | 'vertical' | 'featured' | 'small';

interface DramaCardProps {
  series: DramaSeries;
  variant?: DramaCardVariant;
  onPress?: () => void;
  showRating?: boolean;
  showGenres?: boolean;
  index?: number;
}

const DramaCard: React.FC<DramaCardProps> = ({
  series,
  variant = 'vertical',
  onPress,
  showRating = true,
  showGenres = true,
  index = 0,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Calculate appropriate dimensions based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'horizontal':
        return {
          container: [styles.container, styles.horizontalContainer],
          image: styles.horizontalImage,
          details: styles.horizontalDetails,
          title: styles.horizontalTitle,
        };
      case 'featured':
        return {
          container: [styles.container, styles.featuredContainer],
          image: styles.featuredImage,
          details: styles.featuredDetails,
          title: styles.featuredTitle,
        };
      case 'small':
        return {
          container: [styles.container, styles.smallContainer],
          image: styles.smallImage,
          details: styles.smallDetails,
          title: styles.smallTitle,
        };
      default: // vertical
        return {
          container: [styles.container, styles.verticalContainer],
          image: styles.verticalImage,
          details: styles.verticalDetails,
          title: styles.verticalTitle,
        };
    }
  };
  
  const cardStyle = getCardStyle();
  
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('SeriesDetails', { seriesId: series.id });
    }
  }, [navigation, series.id, onPress]);
  
  // Render stars for rating
  const renderRatingStars = () => {
    if (!showRating) return null;
    
    const rating = Math.round(series.averageRating * 2) / 2; // Round to nearest 0.5
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    
    return (
      <View style={styles.ratingContainer}>
        {Array(5).fill(0).map((_, i) => {
          if (i < fullStars) {
            return <FontAwesome key={i} name="star" size={12} color="#FFD700" />;
          } else if (i === fullStars && halfStar) {
            return <FontAwesome key={i} name="star-half-o" size={12} color="#FFD700" />;
          } else {
            return <FontAwesome key={i} name="star-o" size={12} color="#FFD700" />;
          }
        })}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };
  
  // Truncate text if too long
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <TouchableOpacity 
      style={cardStyle.container} 
      onPress={handlePress}
      activeOpacity={0.8}
      testID={`drama-card-${series.id}`}
    >
      <ImageBackground
        source={{ uri: series.coverImage }}
        style={cardStyle.image}
        imageStyle={{ borderRadius: 8 }}
        onLoadStart={() => setIsImageLoading(true)}
        onLoadEnd={() => setIsImageLoading(false)}
      >
        <View style={styles.overlay}>
          {series.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
          
          {series.isHot && (
            <View style={styles.hotBadge}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.hotText}>HOT</Text>
            </View>
          )}
        </View>
      </ImageBackground>
      
      <View style={cardStyle.details}>
        <Text style={cardStyle.title} numberOfLines={1}>
          {truncateText(series.title, variant === 'small' ? 15 : 20)}
        </Text>
        
        {showGenres && series.genre.length > 0 && (
          <View style={styles.genreContainer}>
            {series.genre.slice(0, 2).map((genre, idx) => (
              <Text key={idx} style={styles.genreText}>
                {genre}{idx < Math.min(series.genre.length - 1, 1) ? ' • ' : ''}
              </Text>
            ))}
          </View>
        )}
        
        {renderRatingStars()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verticalContainer: {
    width: width / 2 - 24, // 2 cards per row with margin
    marginBottom: 16,
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: width - 32,
    height: 120,
    marginBottom: 12,
  },
  featuredContainer: {
    width: width - 32,
    height: 200,
    marginBottom: 16,
  },
  smallContainer: {
    width: width / 3 - 16,
    marginBottom: 12,
  },
  verticalImage: {
    height: 150,
    width: '100%',
    justifyContent: 'flex-end',
  },
  horizontalImage: {
    width: 100,
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  smallImage: {
    height: 120,
    width: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  verticalDetails: {
    padding: 8,
  },
  horizontalDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  featuredDetails: {
    padding: 12,
  },
  smallDetails: {
    padding: 6,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  smallTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#888',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreText: {
    fontSize: 12,
    color: '#666',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  hotBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  hotText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 2,
  },
});

export default DramaCard;