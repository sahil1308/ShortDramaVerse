/**
 * Onboarding Screen
 * 
 * Main screen for user onboarding that displays the animated onboarding carousel
 * and manages the onboarding state.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';
import { RootStackParamList } from '@/types/navigation';
import { storageService } from '@/services/storage';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEventType } from '@/services/analytics';

// Key for storing onboarding completion
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

// Navigation prop type
type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  // Check if onboarding was already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingComplete = await storageService.getItem(ONBOARDING_COMPLETE_KEY);
        
        // If onboarding was already completed, navigate to main
        if (onboardingComplete === 'true') {
          navigation.replace('Main');
        }
        
        // Track onboarding screen view
        analyticsService.trackScreen('Onboarding');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <OnboardingCarousel />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingScreen;