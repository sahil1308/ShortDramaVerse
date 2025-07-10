/**
 * Main Tab Navigator
 * 
 * Bottom tab navigation component for the main app screens
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { 
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home,
  Search,
  List,
  User,
  BarChart,
} from 'lucide-react-native';

import HomeScreen from '@/screens/home/HomeScreen';
import SearchScreen from '@/screens/search/SearchScreen';
import WatchlistScreen from '@/screens/watchlist/WatchlistScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import AdminDashboardScreen from '@/screens/admin/AdminDashboardScreen';

// Define the main tab parameter list
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
  Admin: undefined;
};

// Create the bottom tab navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Tabs Component
 * 
 * @returns Main tab navigation JSX
 */
const MainTabs = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || false;
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <Home
                width={size}
                height={size}
                color={color}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      
      {/* Search Tab */}
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <Search
                width={size}
                height={size}
                color={color}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      
      {/* Watchlist Tab */}
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <List
                width={size}
                height={size}
                color={color}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      
      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <User
                width={size}
                height={size}
                color={color}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      
      {/* Admin Tab - Only visible for admin users */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <BarChart
                  width={size}
                  height={size}
                  color={color}
                  strokeWidth={2}
                />
              </View>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    height: Platform.OS === 'ios' ? 85 : 70,
  },
  tabBarItem: {
    paddingTop: spacing.xs,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Platform.OS === 'ios' ? spacing.xs : 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainTabs;