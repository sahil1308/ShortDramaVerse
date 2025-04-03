import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { MainTabsParamList } from '@/types/drama';
import { useAuth } from '@/hooks/useAuth';

// Import screens for tabs
import HomeScreen from '@/screens/home/HomeScreen';
import SearchScreen from '@/screens/search/SearchScreen';
import WatchlistScreen from '@/screens/watchlist/WatchlistScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Create tab navigator
const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Main tabs navigation component
 * Handles the bottom tab bar and its screens
 */
const MainTabs: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0366d6',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
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
            <Feather name="search" size={size} color={color} />
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
            <Feather name="bookmark" size={size} color={color} />
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
            <Feather name="user" size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel label="Profile" color={color} />
          ),
          headerTitle: `${user?.displayName || user?.username || 'Profile'}`,
        }}
      />
    </Tab.Navigator>
  );
};

// Custom tab label component for consistent styling
const TabLabel = ({ label, color }) => (
  <Text style={[styles.tabLabel, { color }]}>{label}</Text>
);

// Utility component for screen content
export const ScreenContainer = ({ children, style }) => (
  <View style={[styles.screenContainer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopColor: '#eaeaea',
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
  },
  header: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default MainTabs;