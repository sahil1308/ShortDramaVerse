/**
 * Root Navigator Component
 * 
 * Manages the primary navigation structure for the app,
 * including authentication flow, main tabs, and modals.
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Screens
import HomeScreen from '@/screens/home/HomeScreen';
import ExploreScreen from '@/screens/explore/ExploreScreen';
import WatchlistScreen from '@/screens/watchlist/WatchlistScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SeriesDetailScreen from '@/screens/series/SeriesDetailScreen';
import EpisodePlayerScreen from '@/screens/player/EpisodePlayerScreen';
import AuthScreen from '@/screens/auth/AuthScreen';
import OnboardingScreen from '@/screens/onboarding/OnboardingScreen';
import SearchScreen from '@/screens/explore/SearchScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';

// Services
import { anonymousAuthService } from '@/services/anonymousAuth';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEventType } from '@/services/analytics';
import { deviceIdentifierService } from '@/services/deviceIdentifier';

// Types
import { RootStackParamList, MainTabParamList } from '@/types/navigation';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator component
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Watchlist') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0000ff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={styles.loadingText}>Loading ShortDramaVerse...</Text>
  </View>
);

// Root navigator component
const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Initialize app and check if first launch
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize anonymous auth
        const anonymousUser = await anonymousAuthService.initialize();
        
        // Get device info for more detailed tracking
        const deviceInfo = await deviceIdentifierService.getDeviceInfo();
        
        // Check if this is a returning device
        const isReturning = await anonymousAuthService.isReturningDevice();
        setIsFirstLaunch(!isReturning);
        
        // Set anonymous ID in analytics for better tracking
        analyticsService.setAnonymousId(anonymousUser.id);
        
        // Track app launch in analytics with device info
        analyticsService.trackEvent(AnalyticsEventType.APP_OPEN, {
          anonymousId: anonymousUser.id,
          isFirstLaunch: !isReturning,
          deviceId: deviceInfo.deviceId,
          platform: deviceInfo.platform,
          storeSource: deviceInfo.installSource,
          storeCountry: deviceInfo.storeCountry
        });
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Update last seen time when app is opened
  useEffect(() => {
    if (!isLoading) {
      anonymousAuthService.updateLastSeen().catch(console.error);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          // Show onboarding only on first launch, then go straight to main content
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          // Skip auth screen and go directly to main content
          <Stack.Screen name="Main" component={MainTabs} />
        )}
        
        {/* Content screens */}
        <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} options={{ headerShown: true }} />
        <Stack.Screen 
          name="EpisodePlayer" 
          component={EpisodePlayerScreen} 
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
        
        {/* Auth screen is available but not required */}
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333'
  }
});

export default RootNavigator;