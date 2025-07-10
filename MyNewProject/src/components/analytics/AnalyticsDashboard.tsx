/**
 * Analytics Dashboard Component for ShortDramaVerse Mobile
 * 
 * This component displays a comprehensive admin dashboard with
 * aggregate app-wide analytics data and insights.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

// Hooks
import { useAnalytics } from '@/hooks/useAnalytics';

// Components
import EmptyStateView from '@/components/EmptyStateView';

// Types
import { AnalyticsData } from '@/types/drama';

// Get device width for responsive sizing
const { width } = Dimensions.get('window');

/**
 * Time period options for analytics data
 */
type TimePeriod = 'day' | 'week' | 'month' | 'year';

/**
 * Analytics Dashboard Props
 */
interface AnalyticsDashboardProps {
  isAdmin?: boolean;
  showHeader?: boolean;
  onClose?: () => void;
}

/**
 * Analytics Dashboard Component
 * 
 * Displays a comprehensive analytics dashboard for app administrators.
 * 
 * @param props - Analytics dashboard props
 * @returns Analytics dashboard component
 */
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isAdmin = true,
  showHeader = true,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  
  const { getAdminAnalytics, getUserAnalytics } = useAnalytics();
  
  // Fetch analytics data
  const fetchAnalytics = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      
      const data = isAdmin
        ? await getAdminAnalytics()
        : await getUserAnalytics();
      
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Load analytics data on component mount
  useEffect(() => {
    fetchAnalytics();
  }, [isAdmin, timePeriod]);
  
  // Handle refresh
  const handleRefresh = async () => {
    await fetchAnalytics(true);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading analytics dashboard...</Text>
      </View>
    );
  }
  
  // Error state
  if (error) {
    return (
      <EmptyStateView
        icon="error-outline"
        message={error}
        actionText="Try Again"
        onAction={fetchAnalytics}
      />
    );
  }
  
  // No data state
  if (!analyticsData) {
    return (
      <EmptyStateView
        icon="analytics"
        message="No analytics data available"
      />
    );
  }
  
  // Chart configurations
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };
  
  // User growth data for line chart
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [
          analyticsData.totalActiveUsers * 0.4,
          analyticsData.totalActiveUsers * 0.5,
          analyticsData.totalActiveUsers * 0.55,
          analyticsData.totalActiveUsers * 0.75,
          analyticsData.totalActiveUsers * 0.9,
          analyticsData.totalActiveUsers,
        ],
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Active Users'],
  };
  
  // App usage data for pie chart
  const usageData = [
    {
      name: 'Morning',
      population: analyticsData.timeOfDayDistribution.morning,
      color: '#FF6B6B',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Afternoon',
      population: analyticsData.timeOfDayDistribution.afternoon,
      color: '#FFD166',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Evening',
      population: analyticsData.timeOfDayDistribution.evening,
      color: '#06D6A0',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Night',
      population: analyticsData.timeOfDayDistribution.night,
      color: '#118AB2',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];
  
  // Platform usage data for bar chart
  const platformData = {
    labels: ['iOS', 'Android'],
    datasets: [
      {
        data: [
          analyticsData.deviceBreakdown.ios,
          analyticsData.deviceBreakdown.android,
        ],
      },
    ],
  };
  
  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isAdmin ? 'Admin Analytics' : 'Your Analytics'}
          </Text>
          
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Time period selector */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Time Period:</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[styles.filterOption, timePeriod === 'day' && styles.filterOptionActive]}
            onPress={() => setTimePeriod('day')}
          >
            <Text 
              style={[styles.filterText, timePeriod === 'day' && styles.filterTextActive]}
            >
              Day
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, timePeriod === 'week' && styles.filterOptionActive]}
            onPress={() => setTimePeriod('week')}
          >
            <Text 
              style={[styles.filterText, timePeriod === 'week' && styles.filterTextActive]}
            >
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, timePeriod === 'month' && styles.filterOptionActive]}
            onPress={() => setTimePeriod('month')}
          >
            <Text 
              style={[styles.filterText, timePeriod === 'month' && styles.filterTextActive]}
            >
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, timePeriod === 'year' && styles.filterOptionActive]}
            onPress={() => setTimePeriod('year')}
          >
            <Text 
              style={[styles.filterText, timePeriod === 'year' && styles.filterTextActive]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Key metrics section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {analyticsData.totalActiveUsers.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Active Users</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {analyticsData.newUsers.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>New Users</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.round(analyticsData.retentionRate * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Retention Rate</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.floor(analyticsData.averageSessionDuration / 60)}m {Math.round(analyticsData.averageSessionDuration % 60)}s
              </Text>
              <Text style={styles.metricLabel}>Avg. Session</Text>
            </View>
          </View>
        </View>
        
        {/* User growth chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Growth</Text>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={userGrowthData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
        
        {/* Top content section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Content</Text>
          
          <View style={styles.contentList}>
            {analyticsData.topSeries.slice(0, 3).map((series, index) => (
              <View key={index} style={styles.contentItem}>
                <View style={styles.contentRank}>
                  <Text style={styles.contentRankText}>{index + 1}</Text>
                </View>
                
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle} numberOfLines={1}>
                    {series.title}
                  </Text>
                  
                  <View style={styles.contentMetrics}>
                    <Text style={styles.contentMetric}>
                      <MaterialIcons name="visibility" size={14} color="#666666" />{' '}
                      {series.viewCount.toLocaleString()}
                    </Text>
                    
                    <Text style={styles.contentMetric}>
                      <MaterialIcons name="check-circle" size={14} color="#666666" />{' '}
                      {Math.round(series.completionRate * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* User engagement section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Engagement</Text>
          
          <View style={styles.engagementItem}>
            <Text style={styles.engagementLabel}>Retention Rate</Text>
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={analyticsData.retentionRate} 
                color="#4CAF50" 
                style={styles.progressBar} 
              />
              <Text style={styles.progressText}>
                {Math.round(analyticsData.retentionRate * 100)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.engagementItem}>
            <Text style={styles.engagementLabel}>Content Completion Rate</Text>
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={
                  analyticsData.topSeries.reduce(
                    (acc, series) => acc + series.completionRate, 
                    0
                  ) / analyticsData.topSeries.length
                } 
                color="#2196F3" 
                style={styles.progressBar} 
              />
              <Text style={styles.progressText}>
                {Math.round(
                  analyticsData.topSeries.reduce(
                    (acc, series) => acc + series.completionRate, 
                    0
                  ) / analyticsData.topSeries.length * 100
                )}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Platform usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Usage</Text>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={platformData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
            />
          </View>
        </View>
        
        {/* Usage by time of day */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage by Time of Day</Text>
          
          <View style={styles.chartContainer}>
            <PieChart
              data={usageData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>
        
        {/* Revenue section (admin only) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ${analyticsData.totalRevenue.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ${analyticsData.subscriptionRevenue.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Subscription</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ${analyticsData.perContentRevenue.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Per Content</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ${analyticsData.averageRevenuePerUser.toFixed(2)}
                </Text>
                <Text style={styles.metricLabel}>ARPU</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#F9F9F9',
  },
  contentList: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  contentRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentRankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  contentMetrics: {
    flexDirection: 'row',
  },
  contentMetric: {
    fontSize: 12,
    color: '#666666',
    marginRight: 16,
  },
  engagementItem: {
    marginBottom: 16,
  },
  engagementLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    width: 40,
    textAlign: 'right',
  },
});

export default AnalyticsDashboard;