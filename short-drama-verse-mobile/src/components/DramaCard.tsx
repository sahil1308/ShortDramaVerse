import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DramaSeries } from '@/types/drama';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';

// Get screen dimensions for responsive sizing
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// Colors
const colors = {
  primary: '#E50914',
  background: '#121212',
  cardBg: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  rating: '#FFD700',
  premium: '#FFD700',
};

// Props interface
interface DramaCardProps {
  series: DramaSeries;
  onPress?: () => void;
  style?: any;
  showRating?: boolean;
  showTitle?: boolean;
  small?: boolean;
}

const DramaCard: React.FC<DramaCardProps> = ({
  series,
  onPress,
  style,
  showRating = true,
  showTitle = true,
  small = false,
}) => {
  // State for image loading
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Calculate dimensions
  const cardWidth = small ? CARD_WIDTH * 0.7 : CARD_WIDTH;
  const cardHeight = small ? CARD_HEIGHT * 0.7 : CARD_HEIGHT;
  
  // Handle image loading
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  // Handle image error
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth, height: cardHeight }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Card Image */}
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={[styles.loaderContainer, { width: cardWidth, height: cardHeight }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {!imageError ? (
          <Image
            source={{ uri: series.coverImage }}
            style={styles.image}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.errorContainer, { width: cardWidth, height: cardHeight }]}>
            <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
            <Text style={styles.errorText}>Image not available</Text>
          </View>
        )}
        
        {/* Premium badge */}
        {series.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={colors.background} />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
        
        {/* Rating */}
        {showRating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={colors.rating} />
            <Text style={styles.ratingText}>{series.averageRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      
      {/* Card Title */}
      {showTitle && (
        <Text style={styles.title} numberOfLines={2}>
          {series.title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.cardBg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: '80%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    padding: 8,
    height: '20%',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.premium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    color: colors.background,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default DramaCard;