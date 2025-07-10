/**
 * SplashScreen - App loading and initialization screen
 * 
 * This screen handles app initialization, checks for first-time users,
 * and navigates to appropriate screens based on user state.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../App';

// Import services
import { checkOnboardingCompleted } from '../services/storage';
import { initializeAnalytics } from '../services/analytics';
import { getAnonymousUserId } from '../services/anonymousAuth';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    initializeApp();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const initializeApp = async () => {
    try {
      // Initialize analytics
      await initializeAnalytics();
      
      // Get or create anonymous user ID
      const userId = await getAnonymousUserId();
      console.log('Anonymous user ID:', userId);
      
      // Check if onboarding has been completed
      const onboardingCompleted = await checkOnboardingCompleted();
      
      // Wait for minimum splash duration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsInitialized(true);
      
      // Navigate based on onboarding status
      if (onboardingCompleted) {
        navigation.replace('Home');
      } else {
        navigation.replace('Onboarding');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Navigate to onboarding as fallback
      navigation.replace('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎭</Text>
          <Text style={styles.appName}>ShortDramaVerse</Text>
          <Text style={styles.tagline}>Discover. Watch. Enjoy.</Text>
        </View>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, { animationDelay: '0.2s' }]} />
          <View style={[styles.loadingDot, { animationDelay: '0.4s' }]} />
        </View>
        
        <Text style={styles.loadingText}>
          {isInitialized ? 'Ready!' : 'Loading...'}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6b6b',
    marginHorizontal: 5,
    // Note: CSS animations would need to be replaced with React Native animations
    // For now, keeping it simple
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default SplashScreen;