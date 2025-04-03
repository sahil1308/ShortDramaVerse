import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TabParamList } from '@/types/drama';
import { useAuth } from '@/hooks/useAuth';

// Import screens
import HomeScreen from '@/screens/home/HomeScreen';
import SearchScreen from '@/screens/search/SearchScreen';
import WatchlistScreen from '@/screens/watchlist/WatchlistScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator<TabParamList>();

// Colors constants
const colors = {
  primary: '#E50914',
  background: '#121212',
  tabBg: '#1A1A1A',
  active: '#E50914',
  inactive: '#777777',
  text: '#FFFFFF',
};

const MainTabs = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon icon="home" label="Home" color={color} />
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
            <TabBarIcon icon="search" label="Search" color={color} />
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
            <TabBarIcon icon="bookmark" label="Watchlist" color={color} />
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
            <TabBarIcon 
              icon="person" 
              label="Profile" 
              color={color} 
              badge={user?.coinBalance ? user.coinBalance.toString() : null}
            />
          ),
          tabBarLabel: ({ color }) => (
            <TabLabel label="Profile" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Custom Tab Bar Icon component
const TabBarIcon = ({ icon, label, color, badge = null }) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={`${icon}${color === colors.active ? '' : '-outline'}`} size={22} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
};

// Custom Tab Label component
const TabLabel = ({ label, color }) => {
  return <Text style={[styles.tabLabel, { color }]}>{label}</Text>;
};

// Custom Tab Bar Button component
const TabBarButton = ({ children, style }) => {
  return (
    <View style={[styles.tabBarButton, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBg,
    borderTopWidth: 0,
    elevation: 10,
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingBottom: Platform.OS === 'ios' ? 25 : 5,
    paddingTop: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 30,
    height: 30,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MainTabs;