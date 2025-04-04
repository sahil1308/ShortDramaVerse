/**
 * Main App Component for ShortDramaVerse Mobile
 * 
 * This is the root component of the application that sets up providers
 * and the navigation structure.
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';

// Ignore specific harmless warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Navigation
import RootNavigator from './navigation/RootNavigator';

// Providers
import { AuthProvider } from './hooks/useAuth';
import { AnalyticsProvider } from './hooks/useAnalytics';

// Services
import analyticsService from './services/analytics';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

/**
 * Main App Component
 * 
 * Sets up the app environment with all required providers and navigation.
 * 
 * @returns Root app component
 */
export default function App() {
  // Initialize analytics on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize analytics
        await analyticsService.initialize();
        
        // Additional app initialization can go here
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };
    
    initializeApp();
    
    // Handle app cleanup on unmount (this rarely happens in real apps)
    return () => {
      // Any cleanup code can go here
    };
  }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AnalyticsProvider>
              <PaperProvider>
                <StatusBar 
                  barStyle="dark-content"
                  backgroundColor="transparent"
                  translucent={Platform.OS === 'android'}
                />
                <RootNavigator />
              </PaperProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}