/**
 * AdminAnalyticsScreen - Analytics dashboard for admin users
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../../App';
import { getAnalyticsData } from '../services/analytics';

type AdminAnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminAnalytics'>;

const { width: screenWidth } = Dimensions.get('window');

const AdminAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<AdminAnalyticsScreenNavigationProp>();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: getAnalyticsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analyticsData?.totalUsers || 0}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analyticsData?.activeUsers || 0}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analyticsData?.totalViews || 0}</Text>
            <Text style={styles.metricLabel}>Total Views</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analyticsData?.avgSessionDuration || 0}m</Text>
            <Text style={styles.metricLabel}>Avg Session</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Content</Text>
          {analyticsData?.topContent?.map((item, index) => (
            <View key={index} style={styles.contentRow}>
              <Text style={styles.contentRank}>{index + 1}</Text>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentStats}>{item.views} views</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Engagement</Text>
          <View style={styles.engagementCard}>
            <Text style={styles.engagementMetric}>
              Quick Swipe Usage: {analyticsData?.quickSwipeUsage || 0}%
            </Text>
            <Text style={styles.engagementMetric}>
              Video Completion Rate: {analyticsData?.completionRate || 0}%
            </Text>
            <Text style={styles.engagementMetric}>
              Average Watch Time: {analyticsData?.avgWatchTime || 0} minutes
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 48) / 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricValue: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  contentRank: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },
  contentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contentTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentStats: {
    color: '#cccccc',
    fontSize: 14,
  },
  engagementCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  engagementMetric: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
});

export default AdminAnalyticsScreen;