import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DramaSeries } from '@/types/drama';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';

type DramaCardProps = {
  item: DramaSeries;
  compact?: boolean; // For smaller card in horizontal lists
  featured?: boolean; // For featured/hero section
};

// Define navigation prop type
type DramaNavigationProp = StackNavigationProp<RootStackParamList, 'SeriesDetails'>;

const DramaCard: React.FC<DramaCardProps> = ({ 
  item, 
  compact = false, 
  featured = false 
}) => {
  const navigation = useNavigation<DramaNavigationProp>();
  
  // Handle navigation to drama series details
  const handlePress = () => {
    navigation.navigate('SeriesDetails', { seriesId: item.id });
  };
  
  // Render compact card for horizontal scrolling sections
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.thumbnailImage }} 
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.compactGenre} numberOfLines={1}>
            {item.genre.join(' • ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  // Render featured/hero card
  if (featured) {
    return (
      <TouchableOpacity 
        style={styles.featuredContainer} 
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <ImageBackground 
          source={{ uri: item.coverImage }} 
          style={styles.featuredImage}
          resizeMode="cover"
        >
          <View style={styles.featuredGradient}>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredLabel}>FEATURED</Text>
              <Text style={styles.featuredTitle}>{item.title}</Text>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredYear}>{item.releaseYear}</Text>
                <Text style={styles.featuredDot}>•</Text>
                <Text style={styles.featuredEpisodes}>{item.totalEpisodes} Episodes</Text>
                {item.isFree === false && (
                  <>
                    <Text style={styles.featuredDot}>•</Text>
                    <FontAwesome name="diamond" size={12} color="#FFD700" />
                    <Text style={styles.featuredPremium}>Premium</Text>
                  </>
                )}
              </View>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.watchButton}>
                <FontAwesome name="play-circle" size={14} color="#FFF" />
                <Text style={styles.watchButtonText}>Watch Now</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }
  
  // Render standard card
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.thumbnailImage }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.year}>{item.releaseYear}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.episodes}>{item.totalEpisodes} Ep</Text>
          {item.averageRating && (
            <>
              <Text style={styles.dot}>•</Text>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{item.averageRating.toFixed(1)}</Text>
            </>
          )}
        </View>
        <Text style={styles.genre} numberOfLines={1}>
          {item.genre.join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Standard card styles
  container: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 80,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  year: {
    fontSize: 12,
    color: '#B8B8B8',
  },
  dot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
  episodes: {
    fontSize: 12,
    color: '#B8B8B8',
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 2,
  },
  genre: {
    fontSize: 12,
    color: '#999',
  },
  
  // Compact card styles
  compactContainer: {
    width: 120,
    marginRight: 10,
  },
  compactImage: {
    width: 120,
    height: 160,
    borderRadius: 6,
  },
  compactInfo: {
    marginTop: 6,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  compactGenre: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  
  // Featured card styles
  featuredContainer: {
    width: '100%',
    height: 240,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backgroundGradient: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredLabel: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredYear: {
    color: '#DDDDDD',
    fontSize: 13,
  },
  featuredDot: {
    color: '#999',
    marginHorizontal: 6,
  },
  featuredEpisodes: {
    color: '#DDDDDD',
    fontSize: 13,
  },
  featuredPremium: {
    color: '#FFD700',
    fontSize: 13,
    marginLeft: 4,
  },
  featuredDescription: {
    color: '#BBBBBB',
    fontSize: 13,
    marginBottom: 16,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default DramaCard;