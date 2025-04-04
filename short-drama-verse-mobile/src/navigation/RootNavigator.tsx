/**
 * Root Navigator for ShortDramaVerse Mobile
 * 
 * This component manages the root navigation structure,
 * handling authentication flows and main app navigation.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';

// Screens
import AuthScreen from '@/screens/auth/AuthScreen';
import LoadingScreen from '@/screens/common/LoadingScreen';
import OnboardingScreen from '@/screens/onboarding/OnboardingScreen';
import MainTabs from './MainTabs';

// Stack navigators
import SeriesStack from './SeriesStack';
import ProfileStack from './ProfileStack';
import AdminStack from './AdminStack';

// Types
import { RootStackParamList } from '@/types/navigation';

// Create the root stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 * 
 * Manages the primary navigation structure of the app,
 * including authentication state and screen tracking.
 * 
 * @returns Root navigator component
 */
const RootNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { trackScreenView } = useAnalytics();
  
  // Track screen views for analytics
  useEffect(() => {
    const unsubscribe = (state: any) => {
      const currentRouteName = state.routes[state.index].name;
      trackScreenView(currentRouteName);
    };
    
    return () => {
      // Cleanup if needed
    };
  }, [trackScreenView]);
  
  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Authentication flow
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          // Main app flow
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="SeriesStack" component={SeriesStack} />
            <Stack.Screen name="ProfileStack" component={ProfileStack} />
            {user?.isAdmin && (
              <Stack.Screen name="AdminStack" component={AdminStack} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;