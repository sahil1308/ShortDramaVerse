/**
 * Main Tab Navigator
 * 
 * Tab-based navigation for the main screens of the application.
 * Includes the Quick-Swipe Content Accessibility Mode and
 * notification banners for in-app notifications.
 */
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import QuickSwipeScreen from '@/screens/QuickSwipeScreen';
import NotificationManager from '@/components/NotificationManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import { notificationsService } from '@/services/notifications';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAnonymousUser();
  
  // Initialize notifications when the app starts
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationsService.setup();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };
    
    initNotifications();
  }, []);
  
  // Log screen view for analytics
  const handleTabPress = (screenName: string) => {
    analyticsService.trackEvent(AnalyticsEventType.SCREEN_VIEW, {
      screen_name: screenName,
      user_type: user ? 'anonymous' : 'guest',
      user_id: user?.id || 'undefined'
    });
  };
  
  return (
    <React.Fragment>
      {/* Add NotificationManager to display in-app notification banners */}
      <NotificationManager />
      
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#000' : '#fff',
            borderTopColor: isDark ? '#333' : '#eaeaea'
          },
          tabBarActiveTintColor: '#ff5e3a',
          tabBarInactiveTintColor: isDark ? '#888' : '#999'
        }}
        tabBar={(props) => <CustomTabBar {...props} isDark={isDark} />}
      >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          )
        }}
        listeners={{
          tabPress: () => handleTabPress('Home')
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" color={color} size={size} />
          )
        }}
        listeners={{
          tabPress: () => handleTabPress('Search')
        }}
      />
      <Tab.Screen 
        name="QuickSwipe" 
        component={QuickSwipeScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.quickSwipeButton}>
              <MaterialIcons name="swipe" color="#fff" size={size + 4} />
            </View>
          )
        }}
        listeners={{
          tabPress: () => handleTabPress('QuickSwipe')
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="bookmark" color={color} size={size} />
          )
        }}
        listeners={{
          tabPress: () => handleTabPress('Library')
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          )
        }}
        listeners={{
          tabPress: () => handleTabPress('Profile')
        }}
      />
    </Tab.Navigator>
    </React.Fragment>
  );
};

// Custom tab bar component with a blur effect
function CustomTabBar({ state, descriptors, navigation, isDark }: BottomTabBarProps & { isDark: boolean }) {
  const insets = useSafeAreaInsets();
  
  return (
    <BlurView 
      intensity={80} 
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.tabBar,
        { 
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopColor: isDark ? '#333' : '#eaeaea'
        }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        // Special styling for Quick Swipe button
        const isQuickSwipe = route.name === 'QuickSwipe';
        
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityHint={isQuickSwipe ? 'Opens quick swipe content browsing mode' : undefined}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[
              styles.tabButton,
              isQuickSwipe && styles.quickSwipeTabButton
            ]}
          >
            {options.tabBarIcon && 
              options.tabBarIcon({ 
                color: isFocused ? '#ff5e3a' : isDark ? '#888' : '#999', 
                size: 24,
                focused: isFocused
              })
            }
            {!isQuickSwipe && options.tabBarLabel !== '' && (
              <View style={[
                styles.tabLabelContainer,
                isFocused && styles.tabLabelContainerActive
              ]}>
                {typeof options.tabBarLabel === 'string' ? (
                  <View style={styles.tabLabelText}>
                    {options.tabBarLabel || route.name}
                  </View>
                ) : options.tabBarLabel ? (
                  options.tabBarLabel({ 
                    focused: isFocused, 
                    color: isFocused ? '#ff5e3a' : isDark ? '#888' : '#999',
                    position: 'below-icon'
                  })
                ) : (
                  <View style={styles.tabLabelText}>
                    {route.name}
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickSwipeTabButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickSwipeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff5e3a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    transform: [{ translateY: -15 }]
  },
  tabLabelContainer: {
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabLabelContainerActive: {
    backgroundColor: 'rgba(255, 94, 58, 0.1)',
  },
  tabLabelText: {
    fontSize: 10,
    fontWeight: '500',
  }
});

export default MainTabNavigator;