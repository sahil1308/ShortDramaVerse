import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/services/api';
import { DramaSeries } from '@/types/drama';
import { LoadingScreen } from '@/screens/common/LoadingScreen';
import { StatusBar } from 'expo-status-bar';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface SeriesCardProps {
  series: DramaSeries;
  onPress: () => void;
}

const SeriesCard = ({ series, onPress }: SeriesCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{ uri: series.coverImage }}
      style={styles.cardImage}
      resizeMode="cover"
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {series.title}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardGenre}>{series.genre.join(', ')}</Text>
        {series.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch all series
  const {
    data: allSeries,
    isLoading,
    refetch,
  } = useQuery<DramaSeries[]>(['series'], async () => {
    const response = await api.get(endpoints.series.all);
    return response.data;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const navigateToSeriesDetails = (seriesId: number) => {
    navigation.navigate('SeriesDetails', { seriesId });
  };

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  // Group series by genre
  const genreGroups = React.useMemo(() => {
    if (!allSeries) return {};
    
    return allSeries.reduce((acc, series) => {
      series.genre.forEach(genre => {
        if (!acc[genre]) {
          acc[genre] = [];
        }
        acc[genre].push(series);
      });
      return acc;
    }, {} as Record<string, DramaSeries[]>);
  }, [allSeries]);

  // Get top rated series
  const topRatedSeries = React.useMemo(() => {
    if (!allSeries) return [];
    return [...allSeries]
      .filter(series => series.averageRating !== null)
      .sort((a, b) => 
        (b.averageRating as number) - (a.averageRating as number)
      )
      .slice(0, 5);
  }, [allSeries]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Short Drama Verse</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Featured Section */}
        {allSeries && allSeries.length > 0 && (
          <View style={styles.featuredSection}>
            <Image
              source={{ uri: allSeries[0].coverImage }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>{allSeries[0].title}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {allSeries[0].description}
              </Text>
              <TouchableOpacity
                style={styles.watchButton}
                onPress={() => navigateToSeriesDetails(allSeries[0].id)}
              >
                <Text style={styles.watchButtonText}>Watch Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Top Rated Series */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Rated"
            onSeeAll={() => {
              // Navigate to all top rated
            }}
          />
          <FlatList
            data={topRatedSeries}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <SeriesCard
                series={item}
                onPress={() => navigateToSeriesDetails(item.id)}
              />
            )}
          />
        </View>

        {/* Series by Genre */}
        {Object.entries(genreGroups).map(([genre, series]) => (
          <View key={genre} style={styles.section}>
            <SectionHeader
              title={genre}
              onSeeAll={() => {
                // Navigate to genre-specific page
              }}
            />
            <FlatList
              data={series.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <SeriesCard
                  series={item}
                  onPress={() => navigateToSeriesDetails(item.id)}
                />
              )}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredInfo: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 10,
  },
  watchButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#FF5A5F',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: 150,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGenre: {
    fontSize: 12,
    color: '#666',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
});