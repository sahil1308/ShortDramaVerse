/**
 * OnboardingScreen - Interactive onboarding with animated storytelling
 * 
 * This screen provides new users with an engaging introduction to ShortDramaVerse
 * through animated storytelling walkthrough, showcasing key features without
 * requiring mandatory registration.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../App';

// Import services
import { trackUserEngagement } from '../services/analytics';
import { getAnonymousUserId } from '../services/anonymousAuth';
import { setOnboardingCompleted } from '../services/storage';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Onboarding slides data
const onboardingSlides = [
  {
    id: 1,
    title: 'Welcome to ShortDramaVerse',
    description: 'Discover captivating short dramas from around the world. No registration required - start watching immediately!',
    animation: '🎭',
    color: '#ff6b6b',
  },
  {
    id: 2,
    title: 'Personalized Recommendations',
    description: 'Our smart algorithm learns your preferences and suggests content you\'ll love, all while keeping your privacy intact.',
    animation: '🎯',
    color: '#4ecdc4',
  },
  {
    id: 3,
    title: 'Quick Swipe Discovery',
    description: 'Swipe through content effortlessly with our Quick Swipe feature - discover new favorites with intuitive gestures.',
    animation: '👆',
    color: '#45b7d1',
  },
  {
    id: 4,
    title: 'Multiple Ways to Watch',
    description: 'Enjoy free content with ads, unlock premium episodes with coins, or subscribe for unlimited access.',
    animation: '💎',
    color: '#f9ca24',
  },
];

/**
 * OnboardingScreen Component
 * 
 * Interactive onboarding with animated storytelling walkthrough
 */
const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(1);

  // Get anonymous user ID for tracking
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const anonymousId = await getAnonymousUserId();
        setUserId(anonymousId);
        
        // Track onboarding start
        if (anonymousId) {
          await trackUserEngagement(anonymousId, 'onboarding_start', {
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to get anonymous user ID:', error);
      }
    };
    initializeUser();
  }, []);

  // Animate slide transitions
  useEffect(() => {
    animateSlideTransition();
  }, [currentSlide]);

  const animateSlideTransition = () => {
    // Fade out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Handle next slide
  const handleNext = async () => {
    try {
      if (userId) {
        await trackUserEngagement(userId, 'onboarding_slide_next', {
          slideIndex: currentSlide,
          slideTitle: onboardingSlides[currentSlide].title,
          timestamp: new Date().toISOString(),
        });
      }

      if (currentSlide < onboardingSlides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        handleComplete();
      }
    } catch (error) {
      console.error('Failed to track onboarding progress:', error);
      // Continue with navigation even if tracking fails
      if (currentSlide < onboardingSlides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        handleComplete();
      }
    }
  };

  // Handle skip onboarding
  const handleSkip = async () => {
    try {
      if (userId) {
        await trackUserEngagement(userId, 'onboarding_skipped', {
          slideIndex: currentSlide,
          timestamp: new Date().toISOString(),
        });
      }
      
      handleComplete();
    } catch (error) {
      console.error('Failed to track onboarding skip:', error);
      handleComplete();
    }
  };

  // Handle onboarding completion
  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      await setOnboardingCompleted(true);
      
      if (userId) {
        await trackUserEngagement(userId, 'onboarding_completed', {
          totalSlides: onboardingSlides.length,
          completedSlides: currentSlide + 1,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Navigate to home screen
      navigation.replace('Home');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Navigate anyway
      navigation.replace('Home');
    }
  };

  // Handle previous slide
  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = onboardingSlides[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: currentSlideData.color }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentSlideData.color} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Animation/Icon */}
        <View style={styles.animationContainer}>
          <Animated.Text style={[styles.animationEmoji, { transform: [{ scale: scaleAnim }] }]}>
            {currentSlideData.animation}
          </Animated.Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentSlideData.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{currentSlideData.description}</Text>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[styles.navButton, { opacity: currentSlide > 0 ? 1 : 0.3 }]}
          onPress={handlePrevious}
          disabled={currentSlide === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          style={[styles.navButton, styles.primaryButton]}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.primaryButtonText]}>
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  animationEmoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#333333',
  },
});

export default OnboardingScreen;