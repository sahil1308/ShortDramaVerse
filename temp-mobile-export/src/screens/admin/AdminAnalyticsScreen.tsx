/**
 * Admin Analytics Dashboard Screen for ShortDramaVerse Mobile
 * 
 * This screen provides comprehensive analytics for administrators,
 * displaying metrics about user engagement, content performance,
 * and business insights. It's only accessible to admin users.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

/**
 * Time period options for filtering analytics data
 */
type TimePeriod = '7d' | '30d' | '90d' | 'all';

/**
 * AdminAnalyticsScreen Component
 * 
 * Provides a comprehensive dashboard for administrators to monitor
 * app performance, user engagement, and content metrics.
 * 
 * @returns Admin analytics dashboard component
 */
const AdminAnalyticsScreen: React.FC = () => {
  const { useAdminAnalytics } = useAnalytics();
  const { data, isLoading, error, refetch, isAdmin } = useAdminAnalytics();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const navigation = useNavigation();
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Format large numbers with k, m suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };
  
  // Format time in hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Prepare data for user growth chart
  const prepareUserGrowthData = () => {
    if (!data?.userGrowth) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
      };
    }
    
    const labels = data.userGrowth.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const newUsers = data.userGrowth.map(item => item.newUsers);
    
    return {
      labels: labels.slice(-6), // Last 6 points
      datasets: [{ data: newUsers.slice(-6) }],
    };
  };
  
  // Prepare data for revenue by content type
  const prepareRevenueData = () => {
    if (!data?.revenue?.byContentType) {
      return [];
    }
    
    // Generate colors for pie chart
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#2EC4B6', '#E76F51',
    ];
    
    return data.revenue.byContentType.map((item, index) => ({
      name: item.type,
      amount: item.amount,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };
  
  // Get engagement rates for progress chart
  const getEngagementRates = () => {
    if (!data?.engagement) {
      return { data: [0, 0, 0] };
    }
    
    // Normalize values to 0-1 range for progress chart
    const returnRate = Math.min(data.engagement.returningUserRate / 100, 1);
    const sessionQuality = Math.min(data.engagement.averageSessionDuration / 1800, 1); // Normalize to 30min max
    const watchCompletion = Math.min(data.engagement.averageWatchTime / 1200, 1); // Normalize to 20min max
    
    return {
      data: [returnRate, sessionQuality, watchCompletion],
      labels: ['Return Rate', 'Session Quality', 'Watch Completion'],
    };
  };
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };
  
  // If not an admin
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <MaterialIcons name="security" size={60} color="#FF6B6B" />
          <Text style={styles.unauthorizedTitle}>
            Admin Access Required
          </Text>
          <Text style={styles.unauthorizedText}>
            You don't have permission to access the admin dashboard.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          <Text style={styles.title}>Admin Analytics</Text>
          <Text style={styles.subtitle}>
            Monitor user engagement, content performance, and revenue metrics
          </Text>
        </View>
        
        {/* Time Period Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Time Period:</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === '7d' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('7d')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timePeriod === '7d' && styles.activeFilterButtonText,
                ]}
              >
                7 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === '30d' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('30d')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timePeriod === '30d' && styles.activeFilterButtonText,
                ]}
              >
                30 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === '90d' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('90d')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timePeriod === '90d' && styles.activeFilterButtonText,
                ]}
              >
                90 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === 'all' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('all')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timePeriod === 'all' && styles.activeFilterButtonText,
                ]}
              >
                All Time
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading analytics data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={50} color="#FF6B6B" />
            <Text style={styles.errorText}>
              There was an error loading the analytics data
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* User Metrics */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>User Metrics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Daily Active Users</Text>
                  <Text style={styles.statValue}>{formatNumber(data?.activeUsers?.daily || 0)}</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Weekly Active Users</Text>
                  <Text style={styles.statValue}>{formatNumber(data?.activeUsers?.weekly || 0)}</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Monthly Active Users</Text>
                  <Text style={styles.statValue}>{formatNumber(data?.activeUsers?.monthly || 0)}</Text>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>User Growth</Text>
                <LineChart
                  data={prepareUserGrowthData()}
                  width={width - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>
            
            {/* Revenue Metrics */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Revenue Metrics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Daily Revenue</Text>
                  <Text style={styles.statValue}>{formatCurrency(data?.revenue?.daily || 0)}</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Weekly Revenue</Text>
                  <Text style={styles.statValue}>{formatCurrency(data?.revenue?.weekly || 0)}</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Monthly Revenue</Text>
                  <Text style={styles.statValue}>{formatCurrency(data?.revenue?.monthly || 0)}</Text>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Revenue by Content Type</Text>
                {data?.revenue?.byContentType && data.revenue.byContentType.length > 0 ? (
                  <PieChart
                    data={prepareRevenueData()}
                    width={width - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                ) : (
                  <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>
                      No revenue data available for the selected period
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Engagement Metrics */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Engagement Metrics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg. Session Duration</Text>
                  <Text style={styles.statValue}>
                    {formatTime(data?.engagement?.averageSessionDuration || 0)}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg. Watch Time</Text>
                  <Text style={styles.statValue}>
                    {formatTime(data?.engagement?.averageWatchTime || 0)}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Returning User Rate</Text>
                  <Text style={styles.statValue}>
                    {`${data?.engagement?.returningUserRate.toFixed(1) || 0}%`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Engagement KPIs</Text>
                <ProgressChart
                  data={getEngagementRates()}
                  width={width - 40}
                  height={220}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  }}
                  hideLegend={false}
                />
              </View>
            </View>
            
            {/* Top Content */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Top Performing Content</Text>
              
              {data?.topContent && data.topContent.length > 0 ? (
                <View style={styles.contentTableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Title</Text>
                    <Text style={styles.tableHeaderCell}>Views</Text>
                    <Text style={styles.tableHeaderCell}>Rating</Text>
                    <Text style={styles.tableHeaderCell}>Completion</Text>
                  </View>
                  
                  {data.topContent.map((content, index) => (
                    <View key={content.id} style={styles.tableRow}>
                      <Text 
                        style={[styles.tableCell, { flex: 2 }]} 
                        numberOfLines={1}
                      >
                        {content.title}
                      </Text>
                      <Text style={styles.tableCell}>
                        {formatNumber(content.views)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {content.averageRating.toFixed(1)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {`${(content.completionRate * 100).toFixed(0)}%`}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>
                    No content performance data available
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
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  emptyChartText: {
    color: '#666',
    textAlign: 'center',
  },
  contentTableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminAnalyticsScreen;