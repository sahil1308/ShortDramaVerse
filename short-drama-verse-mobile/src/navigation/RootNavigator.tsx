import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import MainTabs from './MainTabs';
import LoadingScreen from '@/screens/common/LoadingScreen';
import SignInScreen from '@/screens/auth/SignIn';
import SignUpScreen from '@/screens/auth/SignUp';
import SeriesDetailsScreen from '@/screens/series/SeriesDetails';
import EpisodePlayerScreen from '@/screens/series/EpisodePlayer';
import UserProfileScreen from '@/screens/profile/UserProfile';
import { RootStackParamList } from '@/types/drama';

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator component that handles the application navigation structure
 * including authentication flow and main content
 */
const RootNavigator: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // If auth is still loading, show loading screen
  if (isLoading) {
    return <LoadingScreen message="Starting ShortDramaVerse..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Conditionally render auth screens or main app screens based on auth state */}
      {!isAuthenticated ? (
        // Auth flow
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: 'Sign In' }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
        </>
      ) : (
        // Main app flow
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="SeriesDetails"
            component={SeriesDetailsScreen}
            options={{ headerShown: true, title: '' }}
          />
          <Stack.Screen
            name="EpisodePlayer"
            component={EpisodePlayerScreen}
            options={{ headerShown: true, title: '' }}
          />
          <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={{ headerShown: true, title: 'Profile' }}
          />
        </>
      )}
      
      {/* Common screens */}
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;