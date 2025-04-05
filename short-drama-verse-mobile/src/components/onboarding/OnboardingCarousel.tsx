/**
 * Onboarding Carousel Component
 * 
 * Presents a series of animated onboarding screens to introduce new users
 * to the app features through a storytelling approach.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
  ViewToken
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomAnimationPlayer from './CustomAnimationPlayer';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { storageService } from '@/services/storage';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEventType } from '@/services/analytics';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Key for storing onboarding completion
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

// Navigation prop type
type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Onboarding step interface
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  animation: any;  // Replace with appropriate Lottie animation type
  backgroundColor: string;
  titleColor: string;
  textColor: string;
}

// Path to onboarding animations
const ANIMATIONS_PATH = '@assets/animations/';

// Onboarding data with storytelling approach
const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ShortDramaVerse',
    description: 'Immerse yourself in the world of short-form drama series. Discover stories that capture your imagination in just minutes.',
    animation: require(`${ANIMATIONS_PATH}welcome.json`),
    backgroundColor: '#3A0CA3',
    titleColor: '#F72585',
    textColor: '#ffffff'
  },
  {
    id: 'discover',
    title: 'Discover Stories',
    description: 'Browse hundreds of exclusive short dramas from around the world. Filter by genre, mood, or time you have available.',
    animation: require(`${ANIMATIONS_PATH}discover.json`),
    backgroundColor: '#4361EE',
    titleColor: '#F72585',
    textColor: '#ffffff'
  },
  {
    id: 'watch',
    title: 'Watch Anywhere',
    description: 'Stream on the go or download to watch offline. Perfect for your commute, break time, or whenever you need a quick escape.',
    animation: require(`${ANIMATIONS_PATH}watch.json`),
    backgroundColor: '#4CC9F0',
    titleColor: '#3A0CA3',
    textColor: '#333333'
  },
  {
    id: 'subscribe',
    title: 'Flexible Options',
    description: 'Watch for free with ads, subscribe for unlimited access, or use coins to unlock premium content. You're in control.',
    animation: require(`${ANIMATIONS_PATH}subscribe.json`),
    backgroundColor: '#F72585',
    titleColor: '#ffffff',
    textColor: '#ffffff'
  },
  {
    id: 'start',
    title: 'Ready to Start?',
    description: 'Your personalized drama journey begins now. Tap "Get Started" to dive into a world of emotions, stories, and characters.',
    animation: require(`${ANIMATIONS_PATH}start.json`),
    backgroundColor: '#7209B7',
    titleColor: '#4CC9F0',
    textColor: '#ffffff'
  }
];

const OnboardingCarousel: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Handle view change for tracking current index
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      
      // Track analytics for onboarding step view
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'onboarding_step_view',
        step_id: onboardingSteps[viewableItems[0].index].id,
        step_index: viewableItems[0].index
      });
    }
  }).current;

  // View config for FlatList
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Handle skip to complete onboarding
  const handleSkip = async () => {
    await completeOnboarding();
  };

  // Handle next to advance to next screen or complete
  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      completeOnboarding();
    }
  };

  // Complete onboarding and navigate to main screen
  const completeOnboarding = async () => {
    try {
      // Mark onboarding as complete
      await storageService.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      
      // Track onboarding completion
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'onboarding_complete',
        total_steps_viewed: currentIndex + 1,
        completed: true
      });
      
      // Navigate to main screen
      navigation.replace('Main');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Navigate anyway even if storage fails
      navigation.replace('Main');
    }
  };

  // Render onboarding step item
  const renderItem = ({ item, index }: { item: OnboardingStep; index: number }) => {
    // Animation for elements
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];
    
    // Title animation
    const titleOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp'
    });
    
    const titleTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp'
    });
    
    // Description animation
    const descriptionOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });
    
    const descriptionTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [60, 0, 60],
      extrapolate: 'clamp'
    });

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.animationContainer}>
          <CustomAnimationPlayer
            animationSource={item.animation}
            autoPlay
            loop
            style={styles.animation}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
                color: item.titleColor
              }
            ]}
          >
            {item.title}
          </Animated.Text>
          
          <Animated.Text
            style={[
              styles.description,
              {
                opacity: descriptionOpacity,
                transform: [{ translateY: descriptionTranslateY }],
                color: item.textColor
              }
            ]}
          >
            {item.description}
          </Animated.Text>
        </View>
      </View>
    );
  };

  // Render dot indicators
  const renderDotIndicators = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingSteps.map((_, index) => {
          // Dot animation
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width
          ];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp'
          });
          
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: currentIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingSteps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
        scrollEventThrottle={16}
      />
      
      {/* Dot indicators */}
      {renderDotIndicators()}
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        {currentIndex < onboardingSteps.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyLeftControl} />
        )}
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentIndex === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentIndex === onboardingSteps.length - 1 ? 'rocket' : 'arrow-forward'}
            size={20}
            color="#fff"
            style={styles.nextIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  animationContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    width: '100%',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyLeftControl: {
    width: 50,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextIcon: {
    marginLeft: 5,
  },
});

export default OnboardingCarousel;