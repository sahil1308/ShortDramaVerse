import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { MainTabParamList } from '@/types/drama';

// Import screens
import HomeScreen from '@/screens/home/HomeScreen';
import SearchScreen from '@/screens/search/SearchScreen';
import WatchlistScreen from '@/screens/watchlist/WatchlistScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Create bottom tabs navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main tabs navigator component
 * Provides navigation between main app screens
 */
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#8E8E8E',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel label="Home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel label="Search" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="playlist-play" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel label="Watchlist" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel label="Profile" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Custom tab label component
 */
const TabLabel: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <React.Fragment>{label}</React.Fragment>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MainTabs;