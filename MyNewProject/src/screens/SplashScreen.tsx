/**
 * Splash Screen Component
 * 
 * Displays a loading screen with logo when the app is initializing.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/constants/theme';

/**
 * Splash Screen Component
 * 
 * @returns Splash screen JSX
 */
const SplashScreen = () => {
  // Animation values
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.8);
  
  // Navigation and Auth
  const navigation = useNavigation();
  const { isInitialized, user } = useAuth();
  
  // Animation sequence
  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
    ]).start();
    
    // Navigate after auth is initialized
    if (isInitialized) {
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: user ? 'Main' : 'Auth' }],
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized, navigation, user, logoOpacity, logoScale]);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <Animated.View style={[
        styles.logoContainer,
        { opacity: logoOpacity, transform: [{ scale: logoScale }] }
      ]}>
        <Text style={styles.logoText}>ShortDramaVerse</Text>
        <Text style={styles.tagline}>Experience drama in short form</Text>
      </Animated.View>
      
      <ActivityIndicator size="large" color={colors.white} style={styles.loader} />
      
      <Text style={styles.loadingText}>Loading amazing content...</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
  },
});

export default SplashScreen;