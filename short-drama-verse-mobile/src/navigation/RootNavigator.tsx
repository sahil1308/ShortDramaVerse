/**
 * Root Navigator
 * 
 * Main navigation container for the app, handling authentication flow
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';
import SplashScreen from '@/screens/SplashScreen';
import AuthScreen from '@/screens/auth/AuthScreen';
import MainTabs from './MainTabs';
import PlayerScreen from '@/screens/player/PlayerScreen';
import SeriesDetailScreen from '@/screens/series/SeriesDetailScreen';
import { colors } from '@/constants/theme';
import { AnalyticsProvider } from '@/hooks/useAnalytics';

// Define the root stack parameter list
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  SeriesDetail: {
    seriesId: number;
    series?: any; // DramaSeries type
  };
  Player: {
    episodeId: number;
    seriesId: number;
    episode?: any; // Episode type
  };
};

// Create the root stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 * 
 * @returns Root navigation JSX
 */
const RootNavigator = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Define theme for navigation container
  const theme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.onBackground,
      border: colors.lightGray,
      notification: colors.error,
    },
  };
  
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AnalyticsProvider>
            <NavigationContainer theme={theme}>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
              />
              
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              >
                {/* Splash Screen */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                
                {/* Auth Screen */}
                <Stack.Screen 
                  name="Auth" 
                  component={AuthScreen}
                  options={{
                    animationTypeForReplace: 'pop',
                  }}
                />
                
                {/* Main App - Tab Navigation */}
                <Stack.Screen name="Main" component={MainTabs} />
                
                {/* Series Detail Screen */}
                <Stack.Screen 
                  name="SeriesDetail" 
                  component={SeriesDetailScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
                
                {/* Player Screen */}
                <Stack.Screen 
                  name="Player" 
                  component={PlayerScreen}
                  options={{
                    animation: 'fade_from_bottom',
                    presentation: 'fullScreenModal',
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </AnalyticsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootNavigator;