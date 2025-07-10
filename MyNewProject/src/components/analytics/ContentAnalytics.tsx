/**
 * Content Analytics Component for ShortDramaVerse Mobile
 * 
 * This component displays analytics data for a specific drama series or episode.
 * It shows various performance metrics such as views, completion rate, and engagement.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

// Components
import EmptyStateView from '@/components/EmptyStateView';

// Hooks
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Content analytics metrics interface
 */
interface ContentMetrics {
  views: number;
  uniqueViewers: number;
  completionRate: number;
  averageWatchTime: number;
  totalWatchTime: number;
  demographics: {
    age: { [key: string]: number };
    gender: { [key: string]: number };
    location: { [key: string]: number };
  };
  viewsByDay: { [key: string]: number };
  deviceTypes: { [key: string]: number };
  retention: number;
  shareCount: number;
  ratingCount: number;
  averageRating: number;
}

/**
 * Content Analytics Props
 */
interface ContentAnalyticsProps {
  seriesId?: number;
  episodeId?: number;
  showHeader?: boolean;
  showActions?: boolean;
  onClose?: () => void;
}

/**
 * Content Analytics Component
 * 
 * Displays detailed analytics for a specific drama series or episode.
 * 
 * @param props - Content analytics props
 * @returns Content analytics component
 */
const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({
  seriesId,
  episodeId,
  showHeader = true,
  showActions = true,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  
  const { getSeriesAnalytics } = useAnalytics();
  
  // Load analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For demo purposes, support series analytics only
        if (seriesId) {
          const data = await getSeriesAnalytics(seriesId);
          setMetrics(data);
        } else if (episodeId) {
          // In a real app, we would fetch episode-specific analytics
          setError('Episode analytics not yet supported');
        } else {
          setError('No content ID provided');
        }
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [seriesId, episodeId, timeRange, getSeriesAnalytics]);
  
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
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
        onAction={() => setIsLoading(true)}
      />
    );
  }
  
  // No data state
  if (!metrics) {
    return (
      <EmptyStateView
        icon="analytics"
        message="No analytics data available for this content"
      />
    );
  }
  
  // Calculate the most active viewing times
  const findPeakViewingTime = () => {
    if (!metrics.viewsByDay) return 'Evening (6PM-10PM)';
    
    const timeSlots = {
      morning: 0,   // 6AM-12PM
      afternoon: 0, // 12PM-6PM
      evening: 0,   // 6PM-10PM
      night: 0,     // 10PM-6AM
    };
    
    // In a real app, we would aggregate the actual data
    // This is simplified for demo purposes
    timeSlots.morning = Math.floor(Math.random() * 100);
    timeSlots.afternoon = Math.floor(Math.random() * 100);
    timeSlots.evening = Math.floor(Math.random() * 100);
    timeSlots.night = Math.floor(Math.random() * 100);
    
    const maxTime = Object.entries(timeSlots).reduce(
      (max, [key, value]) => (value > max.value ? { key, value } : max),
      { key: '', value: 0 }
    );
    
    switch (maxTime.key) {
      case 'morning': return 'Morning (6AM-12PM)';
      case 'afternoon': return 'Afternoon (12PM-6PM)';
      case 'evening': return 'Evening (6PM-10PM)';
      case 'night': return 'Night (10PM-6AM)';
      default: return 'Evening (6PM-10PM)';
    }
  };
  
  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Content Analytics</Text>
          
          {showActions && onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Time range selector */}
      {showActions && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Time Range:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, timeRange === 'day' && styles.filterOptionActive]}
              onPress={() => setTimeRange('day')}
            >
              <Text 
                style={[styles.filterText, timeRange === 'day' && styles.filterTextActive]}
              >
                Day
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterOption, timeRange === 'week' && styles.filterOptionActive]}
              onPress={() => setTimeRange('week')}
            >
              <Text 
                style={[styles.filterText, timeRange === 'week' && styles.filterTextActive]}
              >
                Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterOption, timeRange === 'month' && styles.filterOptionActive]}
              onPress={() => setTimeRange('month')}
            >
              <Text 
                style={[styles.filterText, timeRange === 'month' && styles.filterTextActive]}
              >
                Month
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterOption, timeRange === 'all' && styles.filterOptionActive]}
              onPress={() => setTimeRange('all')}
            >
              <Text 
                style={[styles.filterText, timeRange === 'all' && styles.filterTextActive]}
              >
                All Time
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Key metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.views.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Total Views</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.uniqueViewers.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Unique Viewers</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{Math.round(metrics.completionRate * 100)}%</Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.floor(metrics.averageWatchTime / 60)}m {Math.round(metrics.averageWatchTime % 60)}s
              </Text>
              <Text style={styles.metricLabel}>Avg. Watch Time</Text>
            </View>
          </View>
        </View>
        
        {/* Audience engagement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audience Engagement</Text>
          
          <View style={styles.engagementCard}>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Retention Rate</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={metrics.retention} 
                  color="#4CAF50" 
                  style={styles.progressBar} 
                />
                <Text style={styles.progressText}>{Math.round(metrics.retention * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Completion Rate</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={metrics.completionRate} 
                  color="#2196F3" 
                  style={styles.progressBar} 
                />
                <Text style={styles.progressText}>{Math.round(metrics.completionRate * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Average Rating</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {Array(5).fill(0).map((_, i) => (
                    <MaterialIcons
                      key={i}
                      name={i < Math.floor(metrics.averageRating) ? "star" : (
                        i < Math.ceil(metrics.averageRating) ? "star-half" : "star-outline"
                      )}
                      size={18}
                      color="#FFD700"
                      style={styles.star}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  {metrics.averageRating.toFixed(1)} ({metrics.ratingCount} ratings)
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Audience insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audience Insights</Text>
          
          <View style={styles.insightsCard}>
            <View style={styles.insightItem}>
              <View style={styles.insightIconContainer}>
                <MaterialIcons name="schedule" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Peak Viewing Time</Text>
                <Text style={styles.insightValue}>{findPeakViewingTime()}</Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <View style={styles.insightIconContainer}>
                <MaterialIcons name="devices" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Top Device</Text>
                <Text style={styles.insightValue}>
                  {Object.entries(metrics.deviceTypes).reduce(
                    (max, [key, value]) => (value > max.value ? { key, value } : max),
                    { key: 'Mobile', value: 0 }
                  ).key}
                </Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <View style={styles.insightIconContainer}>
                <MaterialIcons name="share" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Total Shares</Text>
                <Text style={styles.insightValue}>{metrics.shareCount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
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
  engagementCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  insightsCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: '#666666',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default ContentAnalytics;