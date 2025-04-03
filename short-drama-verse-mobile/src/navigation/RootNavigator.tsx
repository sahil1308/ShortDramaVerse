import React, { useEffect, useState } from 'react';
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

// Create the navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// Root Navigator Component
const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  
  // Add a slight delay to prevent flash of loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading || initializing) {
    return <LoadingScreen message="Starting up..." />;
  }
  
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'slide_from_right',
      }}
    >
      {!user ? (
        // Auth screens
        <Stack.Group>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Group>
      ) : (
        // App screens
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          
          <Stack.Screen 
            name="SeriesDetails" 
            component={SeriesDetailsScreen}
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              headerBackTitleVisible: false,
            }}
          />
          
          <Stack.Screen 
            name="EpisodePlayer" 
            component={EpisodePlayerScreen}
            options={{
              headerShown: false,
              animation: 'fade',
              orientation: 'landscape',
            }}
          />
          
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{
              headerShown: true,
              headerTitle: 'Profile',
              headerBackTitleVisible: false,
            }}
          />
          
          <Stack.Screen 
            name="LoadingScreen" 
            component={LoadingScreen} 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;