/**
 * Main Tab Navigator for ShortDramaVerse Mobile
 * 
 * This component manages the bottom tab navigation structure
 * of the main application flow.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

// Screens
import HomeScreen from '@/screens/home/HomeScreen';
import ExploreScreen from '@/screens/explore/ExploreScreen';
import WatchlistScreen from '@/screens/watchlist/WatchlistScreen';
import DownloadsScreen from '@/screens/downloads/DownloadsScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Types
import { MainTabsParamList } from '@/types/navigation';

// Create the bottom tab navigator
const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Main Tabs Component
 * 
 * Manages the bottom tab navigation for the main app screens.
 * 
 * @returns Main tabs navigator component
 */
const MainTabs: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          paddingBottom: Platform.OS === 'android' ? 8 : 25,
          paddingTop: 8,
          height: Platform.OS === 'android' ? 60 : 80,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="file-download" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              {user?.isAdmin && (
                <View style={styles.adminBadge} />
              )}
              <MaterialIcons name="person" color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  adminBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#FF6B6B',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
});

export default MainTabs;