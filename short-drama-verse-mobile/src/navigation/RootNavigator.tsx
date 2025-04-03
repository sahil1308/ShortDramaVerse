import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { DramaSeries, Episode } from '@/types/drama';

// Import screens
import SignIn from '@/screens/auth/SignIn';
import SignUp from '@/screens/auth/SignUp';
import MainTabs from './MainTabs';
import SeriesDetails from '@/screens/series/SeriesDetails';
import EpisodePlayer from '@/screens/series/EpisodePlayer';
import UserProfile from '@/screens/profile/UserProfile';
import LoadingScreen from '@/screens/common/LoadingScreen';

// Define root stack param list for type safety
export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  SeriesDetails: { id: number };
  EpisodePlayer: { 
    episode: Episode;
    series: DramaSeries;
  };
  UserProfile: { userId: number };
  LoadingScreen: { message?: string };
};

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="LoadingScreen" 
          component={LoadingScreen} 
          initialParams={{ message: 'Starting up...' }} 
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!user ? (
        // Auth screens
        <>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      ) : (
        // Main app screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SeriesDetails" component={SeriesDetails} />
          <Stack.Screen name="EpisodePlayer" component={EpisodePlayer} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
        </>
      )}
    </Stack.Navigator>
  );
}