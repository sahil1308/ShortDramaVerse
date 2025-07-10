/**
 * ShortDramaVerse Mobile App
 * 
 * A comprehensive streaming platform for short-form drama content
 * with navigation, user tracking, and content management.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

// Simple navigation state management
type Screen = 'home' | 'player' | 'settings' | 'analytics';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simple initialization
    const initializeApp = async () => {
      try {
        console.log('ShortDramaVerse app initializing...');
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInitialized(true);
        console.log('ShortDramaVerse app initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true); // Continue even if initialization fails
      }
    };

    initializeApp();
  }, []);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderHomeScreen = () => (
    <ScrollView style={styles.content}>
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>🎭 ShortDramaVerse</Text>
        <Text style={styles.heroSubtitle}>Discover. Watch. Enjoy.</Text>
        <Text style={styles.heroDescription}>
          Your gateway to captivating short-form drama content
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Dramas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Romance Mystery', 'Action Thriller', 'Comedy Gold', 'Drama Classic'].map((title, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dramaCard}
              onPress={() => navigateToScreen('player')}
            >
              <View style={styles.dramaImage}>
                <Text style={styles.dramaEmoji}>🎬</Text>
              </View>
              <Text style={styles.dramaTitle}>{title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToScreen('player')}
          >
            <Text style={styles.actionEmoji}>▶️</Text>
            <Text style={styles.actionText}>Watch Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToScreen('settings')}
          >
            <Text style={styles.actionEmoji}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToScreen('analytics')}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Quick Swipe feature coming soon!')}
          >
            <Text style={styles.actionEmoji}>👆</Text>
            <Text style={styles.actionText}>Quick Swipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderPlayerScreen = () => (
    <View style={styles.content}>
      <View style={styles.playerContainer}>
        <View style={styles.videoPlayer}>
          <Text style={styles.playIcon}>▶️</Text>
          <Text style={styles.videoTitle}>Sample Drama Episode</Text>
        </View>
        
        <View style={styles.playerControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>⏮️ Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>⏸️ Pause</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>⏭️ Next</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.videoInfo}>
          <Text style={styles.videoInfoTitle}>Romance Mystery - Episode 1</Text>
          <Text style={styles.videoInfoDesc}>
            A captivating story of love and mystery that unfolds in unexpected ways...
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSettingsScreen = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        {[
          { title: 'Video Quality', value: 'Auto' },
          { title: 'Language', value: 'English' },
          { title: 'Notifications', value: 'On' },
          { title: 'Data Usage', value: 'Optimized' },
          { title: 'Subtitles', value: 'Off' },
        ].map((setting, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <Text style={styles.settingValue}>{setting.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsScreen = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>1,234</Text>
            <Text style={styles.analyticsLabel}>Total Views</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>45m</Text>
            <Text style={styles.analyticsLabel}>Watch Time</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>89%</Text>
            <Text style={styles.analyticsLabel}>Engagement</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>12</Text>
            <Text style={styles.analyticsLabel}>Favorites</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentScreen) {
      case 'player':
        return renderPlayerScreen();
      case 'settings':
        return renderSettingsScreen();
      case 'analytics':
        return renderAnalyticsScreen();
      default:
        return renderHomeScreen();
    }
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.splashContent}>
          <Text style={styles.splashLogo}>🎭</Text>
          <Text style={styles.splashTitle}>ShortDramaVerse</Text>
          <Text style={styles.splashSubtitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShortDramaVerse</Text>
        <TouchableOpacity onPress={() => navigateToScreen('home')}>
          <Text style={styles.headerAction}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home', icon: '🏠', label: 'Home' },
          { key: 'player', icon: '▶️', label: 'Player' },
          { key: 'settings', icon: '⚙️', label: 'Settings' },
          { key: 'analytics', icon: '📊', label: 'Stats' },
        ].map((nav) => (
          <TouchableOpacity
            key={nav.key}
            style={[
              styles.navItem,
              currentScreen === nav.key && styles.navItemActive
            ]}
            onPress={() => navigateToScreen(nav.key as Screen)}
          >
            <Text style={styles.navIcon}>{nav.icon}</Text>
            <Text style={[
              styles.navLabel,
              currentScreen === nav.key && styles.navLabelActive
            ]}>
              {nav.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerAction: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  dramaCard: {
    marginRight: 15,
    width: 120,
  },
  dramaImage: {
    width: 120,
    height: 160,
    backgroundColor: '#333333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dramaEmoji: {
    fontSize: 40,
  },
  dramaTitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#333333',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  playerContainer: {
    padding: 20,
  },
  videoPlayer: {
    height: 200,
    backgroundColor: '#333333',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    padding: 10,
  },
  controlText: {
    fontSize: 16,
    color: '#ffffff',
  },
  videoInfo: {
    paddingTop: 20,
  },
  videoInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  videoInfoDesc: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingTitle: {
    fontSize: 16,
    color: '#ffffff',
  },
  settingValue: {
    fontSize: 16,
    color: '#ff6b6b',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#333333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 5,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#333333',
    borderRadius: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#cccccc',
  },
  navLabelActive: {
    color: '#ffffff',
  },
});

export default App;