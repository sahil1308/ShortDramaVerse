import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { RootStackParamList } from '@/types/drama';

// Import screens
import SignIn from '@/screens/auth/SignIn';
import SignUp from '@/screens/auth/SignUp';
import MainTabs from './MainTabs';
import SeriesDetails from '@/screens/series/SeriesDetails';
import EpisodePlayer from '@/screens/series/EpisodePlayer';
import UserProfile from '@/screens/profile/UserProfile';
import LoadingScreen from '@/screens/common/LoadingScreen';

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator component
 * Handles authentication flow and main navigation structure
 */
const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Loading" 
          component={LoadingScreen} 
          initialParams={{ message: 'Loading...' }} 
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Authenticated user flows
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="SeriesDetails" 
            component={SeriesDetails} 
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen 
            name="EpisodePlayer" 
            component={EpisodePlayer} 
            options={{ 
              animation: 'slide_from_bottom',
              presentation: 'fullScreenModal',
              orientation: 'landscape'
            }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfile} 
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen 
            name="Loading" 
            component={LoadingScreen} 
            options={{ 
              animation: 'fade',
              presentation: 'transparentModal' 
            }}
          />
        </>
      ) : (
        // Authentication flows
        <>
          <Stack.Screen name="Login" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;