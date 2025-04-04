/**
 * ShortDramaVerse Mobile App
 * 
 * The main application component that sets up providers and navigation.
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Import main navigator
import RootNavigator from './src/navigation/RootNavigator';

// Import providers
import { AuthProvider } from './src/hooks/useAuth';
import { AnalyticsProvider } from './src/hooks/useAnalytics';

// Setup React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Setup theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7B68EE', // Medium slate blue
    accent: '#FF6B6B', // Light red
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    error: '#FF5252',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

/**
 * App Component
 * 
 * Root component that sets up providers and the navigation container.
 */
const App = () => {
  // Initialize analytics when app starts
  useEffect(() => {
    analytics.initialize();
  }, []);
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AnalyticsProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </AnalyticsProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;