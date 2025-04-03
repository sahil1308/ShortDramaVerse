import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  ImageBackground
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { DramaSeries } from '@/types/drama';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';

type DramaCardProps = {
  item: DramaSeries;
  size?: 'small' | 'medium' | 'large';
  variant?: 'poster' | 'horizontal' | 'featured';
  onPress?: () => void;
};

/**
 * DramaCard Component
 * 
 * Renders a card for a drama series with different variants and sizes
 * 
 * @param item - The drama series data to display
 * @param size - The size of the card (small, medium, large)
 * @param variant - The layout variant of the card (poster, horizontal, featured)
 * @param onPress - Optional custom onPress handler
 */
const DramaCard: React.FC<DramaCardProps> = ({ 
  item, 
  size = 'medium', 
  variant = 'poster',
  onPress 
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  
  // Get card dimensions based on size and variant
  const getDimensions = () => {
    const dimensions = {
      width: 0,
      height: 0,
      imageHeight: 0,
    };
    
    switch (variant) {
      case 'poster':
        switch (size) {
          case 'small':
            dimensions.width = screenWidth * 0.3;
            dimensions.height = screenWidth * 0.45;
            dimensions.imageHeight = screenWidth * 0.35;
            break;
          case 'medium':
            dimensions.width = screenWidth * 0.4;
            dimensions.height = screenWidth * 0.6;
            dimensions.imageHeight = screenWidth * 0.5;
            break;
          case 'large':
            dimensions.width = screenWidth * 0.5;
            dimensions.height = screenWidth * 0.75;
            dimensions.imageHeight = screenWidth * 0.65;
            break;
        }
        break;
      case 'horizontal':
        dimensions.width = screenWidth - 40;
        dimensions.height = 120;
        dimensions.imageHeight = 120;
        break;
      case 'featured':
        dimensions.width = screenWidth - 40;
        dimensions.height = screenWidth * 0.5;
        dimensions.imageHeight = screenWidth * 0.5;
        break;
    }
    
    return dimensions;
  };
  
  const { width, height, imageHeight } = getDimensions();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('SeriesDetails', { id: item.id });
    }
  };
  
  // Poster variant
  if (variant === 'poster') {
    return (
      <TouchableOpacity 
        style={[styles.container, { width, height }]} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.cardContainer}>
          <Image 
            source={{ uri: item.coverImage }} 
            style={[styles.posterImage, { height: imageHeight }]} 
            resizeMode="cover"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.averageRating.toFixed(1)}</Text>
            </View>
          </View>
          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
  
  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity 
        style={[styles.horizontalContainer, { width, height }]} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.coverImage }} 
          style={styles.horizontalImage} 
          resizeMode="cover"
        />
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.horizontalDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.horizontalMeta}>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.averageRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.year}>{item.releaseYear}</Text>
            {item.isPremium && (
              <View style={styles.smallPremiumBadge}>
                <Text style={styles.smallPremiumText}>PREMIUM</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  // Featured variant
  return (
    <TouchableOpacity 
      style={[styles.featuredContainer, { width, height: imageHeight }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageBackground 
        source={{ uri: item.bannerImage || item.coverImage }} 
        style={styles.featuredBackground}
        resizeMode="cover"
      >
        <View style={styles.featuredGradient}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.featuredRating}>{item.averageRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.featuredYear}>{item.releaseYear}</Text>
              {item.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              )}
            </View>
            <Text style={styles.featuredDescription} numberOfLines={2}>{item.description}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posterImage: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  infoContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222222',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
    color: '#555555',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6A5ACD',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  premiumText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Horizontal variant styles
  horizontalContainer: {
    flexDirection: 'row',
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalImage: {
    width: 100,
    height: '100%',
  },
  horizontalInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222222',
  },
  horizontalDescription: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 8,
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  year: {
    fontSize: 12,
    color: '#555555',
    marginLeft: 12,
  },
  smallPremiumBadge: {
    backgroundColor: '#6A5ACD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 12,
  },
  smallPremiumText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Featured variant styles
  featuredContainer: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredBackground: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredRating: {
    fontSize: 14,
    marginLeft: 4,
    color: 'white',
    fontWeight: '600',
  },
  featuredYear: {
    fontSize: 14,
    color: 'white',
    marginLeft: 16,
    fontWeight: '500',
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default DramaCard;