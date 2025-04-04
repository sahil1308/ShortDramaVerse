/**
 * User Analytics Screen for ShortDramaVerse Mobile
 * 
 * This screen displays personalized analytics data for the current user,
 * including viewing history, favorite genres, and engagement metrics.
 * It provides insights into the user's content consumption patterns.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * UserAnalyticsScreen Component
 * 
 * Displays personalized analytics and insights about the user's viewing habits
 * including total watch time, favorite genres, and viewing patterns.
 * 
 * @returns User analytics screen component
 */
const UserAnalyticsScreen: React.FC = () => {
  const { useUserAnalytics } = useAnalytics();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useUserAnalytics();
  
  // Format hours and minutes from seconds
  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Get day name from day number
  const getDayName = (dayNumber: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNumber];
  };
  
  // Prepare data for charts
  const prepareGenreData = () => {
    if (!data?.favoriteGenres) return [];
    
    // Get top 5 genres
    const topGenres = [...data.favoriteGenres]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Generate colors for pie chart
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#2EC4B6', '#E76F51',
      '#F4A261', '#7678ED', '#3D5A80', '#98C1D9', '#293241',
    ];
    
    return topGenres.map((genre, index) => ({
      name: genre.name,
      count: genre.count,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };
  
  const prepareWeekdayData = () => {
    if (!data?.watchByDayOfWeek) {
      return {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
      };
    }
    
    // Create array with all days of week
    const allDays = Array(7).fill(0);
    
    // Fill in data for days that have watches
    data.watchByDayOfWeek.forEach(item => {
      allDays[item.day] = item.count;
    });
    
    return {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{ data: allDays }],
    };
  };
  
  const prepareDailyData = () => {
    if (!data?.watchByTimeOfDay) {
      return {
        labels: ['6am', '12pm', '6pm', '12am'],
        datasets: [{ data: [0, 0, 0, 0] }],
      };
    }
    
    // Group hours into 4 time blocks
    const timeBlocks = [0, 0, 0, 0]; // morning, afternoon, evening, night
    
    data.watchByTimeOfDay.forEach(item => {
      const hour = item.hour;
      if (hour >= 6 && hour < 12) {
        timeBlocks[0] += item.count; // morning
      } else if (hour >= 12 && hour < 18) {
        timeBlocks[1] += item.count; // afternoon
      } else if (hour >= 18 && hour < 24) {
        timeBlocks[2] += item.count; // evening
      } else {
        timeBlocks[3] += item.count; // night (12am-6am)
      }
    });
    
    return {
      labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
      datasets: [{ data: timeBlocks }],
    };
  };
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };
  
  // If user is not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="analytics" size={60} color="#ccc" />
          <Text style={styles.notLoggedInText}>
            You need to be logged in to view your analytics
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Viewing Stats</Text>
          <Text style={styles.subtitle}>
            Personal insights based on your watching activity
          </Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={50} color="#FF6B6B" />
            <Text style={styles.errorText}>
              There was an error loading your stats
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialIcons name="timer" size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>
                  {formatWatchTime(data?.totalViewTime || 0)}
                </Text>
                <Text style={styles.statLabel}>Total Watch Time</Text>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="movie" size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>
                  {data?.episodesCompleted || 0}
                </Text>
                <Text style={styles.statLabel}>Episodes Watched</Text>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="playlist-play" size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>
                  {data?.seriesStarted || 0}
                </Text>
                <Text style={styles.statLabel}>Series Started</Text>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="done-all" size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>
                  {data?.seriesCompleted || 0}
                </Text>
                <Text style={styles.statLabel}>Series Completed</Text>
              </View>
            </View>
            
            {/* Favorite Genres */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Your Favorite Genres</Text>
              
              {data?.favoriteGenres && data.favoriteGenres.length > 0 ? (
                <View style={styles.chartContainer}>
                  <PieChart
                    data={prepareGenreData()}
                    width={width - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    center={[10, 10]}
                    absolute
                  />
                </View>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>
                    Watch more content to see your favorite genres
                  </Text>
                </View>
              )}
            </View>
            
            {/* Viewing Patterns */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Viewing Patterns</Text>
              
              <View style={styles.subsectionContainer}>
                <Text style={styles.subsectionTitle}>By Day of Week</Text>
                
                <BarChart
                  data={prepareWeekdayData()}
                  width={width - 40}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero
                  showValuesOnTopOfBars
                />
              </View>
              
              <View style={styles.subsectionContainer}>
                <Text style={styles.subsectionTitle}>By Time of Day</Text>
                
                <BarChart
                  data={prepareDailyData()}
                  width={width - 40}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero
                  showValuesOnTopOfBars
                />
              </View>
            </View>
            
            {/* Recommendations */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Personalized Insights</Text>
              
              <View style={styles.insightCard}>
                <MaterialIcons name="lightbulb" size={24} color="#FF6B6B" />
                <Text style={styles.insightText}>
                  You watch most content on {getDayName(
                    data?.watchByDayOfWeek?.sort((a, b) => b.count - a.count)[0]?.day || 0
                  )}. 
                  We'll send you notifications about new releases on this day.
                </Text>
              </View>
              
              {data?.favoriteGenres?.length > 0 && (
                <View style={styles.insightCard}>
                  <MaterialIcons name="category" size={24} color="#FF6B6B" />
                  <Text style={styles.insightText}>
                    Based on your viewing history, you might enjoy more content in the{' '}
                    {data.favoriteGenres[0].name} genre.
                  </Text>
                </View>
              )}
              
              {data?.averageRating > 0 && (
                <View style={styles.insightCard}>
                  <MaterialIcons name="star" size={24} color="#FF6B6B" />
                  <Text style={styles.insightText}>
                    Your average rating is {data.averageRating.toFixed(1)} out of 5.
                    {data.averageRating > 4 ? " You're quite the critic!" : 
                     data.averageRating > 3 ? " You're balanced in your reviews." : 
                     " You tend to be selective with your ratings."}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 20,
  },
  emptyChartText: {
    color: '#666',
    textAlign: 'center',
  },
  subsectionContainer: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  insightCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    lineHeight: 20,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  notLoggedInText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserAnalyticsScreen;