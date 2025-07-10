/**
 * ShortDramaVerse Mobile App
 * 
 * The main application component that sets up providers, navigation, and initializes
 * the anonymous authentication system for user tracking without mandatory registration.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import QuickSwipeScreen from './src/screens/QuickSwipeScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AdminAnalyticsScreen from './src/screens/AdminAnalyticsScreen';

// Import services
import { initializeAnonymousAuth } from './src/services/anonymousAuth';
import { initializeDeviceIdentifier } from './src/services/deviceIdentifier';
import { initializeNotifications } from './src/services/notifications';

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  VideoPlayer: { dramaId: string; episodeId: string };
  QuickSwipe: undefined;
  NotificationSettings: undefined;
  AdminAnalytics: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Create QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

/**
 * Main App component with all providers and navigation setup
 */
const App: React.FC = () => {
  useEffect(() => {
    // Initialize core services for anonymous user tracking and device identification
    const initializeApp = async () => {
      try {
        // Initialize anonymous authentication for user tracking without mandatory registration
        await initializeAnonymousAuth();
        
        // Initialize device identifier for cross-platform user tracking
        await initializeDeviceIdentifier();
        
        // Initialize push notifications system
        await initializeNotifications();
        
        console.log('ShortDramaVerse app initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#000000' },
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen 
                name="VideoPlayer" 
                component={VideoPlayerScreen}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="QuickSwipe" component={QuickSwipeScreen} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
              <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;