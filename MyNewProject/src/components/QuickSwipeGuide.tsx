/**
 * Quick Swipe Guide Component
 * 
 * Onboarding component that explains how to use the Quick-Swipe Content Accessibility Mode.
 * Provides visual instructions and interactive demonstrations.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Image
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { storageService } from '@/services/storage';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';
import { SwipeDirection } from './SwipeableCard';

const { width, height } = Dimensions.get('window');

const GUIDE_SHOWN_KEY = 'quick_swipe_guide_shown';

interface QuickSwipeGuideProps {
  onClose: () => void;
}

const QuickSwipeGuide: React.FC<QuickSwipeGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY()).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  
  // Guide steps
  const steps = [
    {
      title: 'Welcome to Quick-Swipe Mode',
      description: 'Discover personalized content with intuitive swipe gestures!',
      imageSource: require('@/assets/images/quick-swipe-intro.png'),
      direction: SwipeDirection.NONE
    },
    {
      title: 'Swipe Right',
      description: 'Swipe right to add content to your watchlist',
      imageSource: require('@/assets/images/swipe-right.png'),
      direction: SwipeDirection.RIGHT
    },
    {
      title: 'Swipe Left',
      description: "Swipe left to skip content you're not interested in",
      imageSource: require('@/assets/images/swipe-left.png'),
      direction: SwipeDirection.LEFT
    },
    {
      title: 'Swipe Up',
      description: 'Swipe up to view more details about the content',
      imageSource: require('@/assets/images/swipe-up.png'),
      direction: SwipeDirection.UP
    },
    {
      title: 'Swipe Down',
      description: 'Swipe down to share the content with friends',
      imageSource: require('@/assets/images/swipe-down.png'),
      direction: SwipeDirection.DOWN
    },
    {
      title: "You're Ready!",
      description: 'Start exploring content with your new swiping skills',
      imageSource: require('@/assets/images/quick-swipe-ready.png'),
      direction: SwipeDirection.NONE
    }
  ];
  
  // Create pan responder to handle demo swipes
  const panResponder = useRef(
    PanResponder.create({
      // Don't capture events if we're not the target of them
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        // Only enable swiping on steps that have a direction
        if (steps[currentStep].direction !== SwipeDirection.NONE) {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },
      onPanResponderRelease: (event, gesture) => {
        // Only process swipes on steps that have a direction
        if (steps[currentStep].direction !== SwipeDirection.NONE) {
          // Calculate swipe distance and speed
          const swipeMagnitude = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);
          const swipeVelocity = Math.sqrt(gesture.vx * gesture.vx + gesture.vy * gesture.vy);
          
          // Determine primary swipe direction
          let direction = SwipeDirection.NONE;
          
          if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
            direction = gesture.dx > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
          } else {
            direction = gesture.dy > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
          }
          
          // Check if swipe matches the current step's direction
          if (direction === steps[currentStep].direction && swipeMagnitude > 50) {
            // Animate completion of the swipe
            completeSwipe(direction);
          } else {
            // Reset position if not swiped far enough or wrong direction
            resetPosition();
          }
        }
      }
    })
  ).current;
  
  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Track guide start
    analyticsService.trackEvent(AnalyticsEventType.QUICK_SWIPE_GUIDE_VIEW, {
      step: 1,
      total_steps: steps.length
    });
  }, []);
  
  // Helper to show a complete swipe animation
  const completeSwipe = (direction: SwipeDirection) => {
    let toValue = { x: 0, y: 0 };
    
    switch (direction) {
      case SwipeDirection.RIGHT:
        toValue = { x: width, y: 0 };
        break;
      case SwipeDirection.LEFT:
        toValue = { x: -width, y: 0 };
        break;
      case SwipeDirection.UP:
        toValue = { x: 0, y: -height };
        break;
      case SwipeDirection.DOWN:
        toValue = { x: 0, y: height };
        break;
    }
    
    // First animate the position
    Animated.timing(position, {
      toValue,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Then fade out the card
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Move to next step after animation completes
      goToNextStep();
      
      // Reset for next step
      position.setValue({ x: 0, y: 0 });
      cardOpacity.setValue(1);
    });
  };
  
  // Helper to reset the position with animation
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true
    }).start();
  };
  
  // Go to next step
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        
        // Track guide progress
        analyticsService.trackEvent(AnalyticsEventType.QUICK_SWIPE_GUIDE_VIEW, {
          step: newStep + 1,
          total_steps: steps.length
        });
        
        return newStep;
      });
    } else {
      handleFinish();
    }
  };
  
  // Go to previous step
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => {
        const newStep = prev - 1;
        
        // Track guide navigation
        analyticsService.trackEvent(AnalyticsEventType.QUICK_SWIPE_GUIDE_VIEW, {
          step: newStep + 1,
          total_steps: steps.length,
          action: 'back'
        });
        
        return newStep;
      });
    }
  };
  
  // Handle finish
  const handleFinish = async () => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setShowModal(false);
      
      // Mark guide as shown
      storageService.setItem(GUIDE_SHOWN_KEY, 'true');
      
      // Track guide completion
      analyticsService.trackEvent(AnalyticsEventType.QUICK_SWIPE_GUIDE_COMPLETE, {
        total_steps: steps.length
      });
      
      // Call the onClose callback
      onClose();
    });
  };
  
  // Skip the guide
  const handleSkip = () => {
    // Track skip action
    analyticsService.trackEvent(AnalyticsEventType.QUICK_SWIPE_GUIDE_SKIP, {
      current_step: currentStep + 1,
      total_steps: steps.length
    });
    
    handleFinish();
  };
  
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  
  if (!showModal) {
    return null;
  }
  
  // Calculate card rotation based on swipe position
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });
  
  return (
    <Modal
      transparent={true}
      visible={showModal}
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Quick-Swipe Guide</Text>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
          
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {steps.map((step, index) => (
              <View 
                key={index} 
                style={[
                  styles.stepDot,
                  index === currentStep && styles.stepDotActive
                ]} 
              />
            ))}
          </View>
          
          {/* Demo Card Area */}
          <View style={styles.demoArea}>
            {currentStepData.direction !== SwipeDirection.NONE ? (
              <Animated.View
                style={[
                  styles.demoCard,
                  {
                    transform: [
                      { translateX: position.x },
                      { translateY: position.y },
                      { rotate }
                    ],
                    opacity: cardOpacity
                  }
                ]}
                {...panResponder.panHandlers}
              >
                <Image
                  source={currentStepData.imageSource}
                  style={styles.demoImage}
                  resizeMode="cover"
                />
                <View style={styles.demoOverlay}>
                  <View style={styles.demoContent}>
                    <Text style={styles.demoTitle}>Sample Content</Text>
                    <Text style={styles.demoDescription}>Swipe to try it out!</Text>
                  </View>
                </View>
                
                {currentStepData.direction === SwipeDirection.RIGHT && (
                  <View style={[styles.demoIndicator, styles.rightIndicator]}>
                    <FontAwesome name="bookmark" size={24} color="#fff" />
                  </View>
                )}
                
                {currentStepData.direction === SwipeDirection.LEFT && (
                  <View style={[styles.demoIndicator, styles.leftIndicator]}>
                    <FontAwesome name="close" size={24} color="#fff" />
                  </View>
                )}
                
                {currentStepData.direction === SwipeDirection.UP && (
                  <View style={[styles.demoIndicator, styles.upIndicator]}>
                    <FontAwesome name="info-circle" size={24} color="#fff" />
                  </View>
                )}
                
                {currentStepData.direction === SwipeDirection.DOWN && (
                  <View style={[styles.demoIndicator, styles.downIndicator]}>
                    <FontAwesome name="share" size={24} color="#fff" />
                  </View>
                )}
              </Animated.View>
            ) : (
              <View style={styles.introImageContainer}>
                <Image
                  source={currentStepData.imageSource}
                  style={styles.introImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
          
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
          </View>
          
          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {!isFirstStep && (
              <TouchableOpacity style={styles.navButton} onPress={goToPrevStep}>
                <MaterialIcons name="arrow-back" size={24} color="#555" />
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.navButton, styles.primaryNavButton]} 
              onPress={isLastStep ? handleFinish : goToNextStep}
            >
              <Text style={styles.primaryNavButtonText}>
                {isLastStep ? 'Get Started' : 'Next'}
              </Text>
              {!isLastStep && (
                <MaterialIcons name="arrow-forward" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Check if the guide should be shown
export async function shouldShowQuickSwipeGuide(): Promise<boolean> {
  const hasShownGuide = await storageService.getItem(GUIDE_SHOWN_KEY);
  return hasShownGuide !== 'true';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  skipButton: {
    padding: 5,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#ff5e3a',
    width: 16,
  },
  demoArea: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  demoCard: {
    width: width * 0.7,
    height: height * 0.35,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  demoImage: {
    width: '100%',
    height: '100%',
  },
  demoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  demoDescription: {
    color: '#fff',
    fontSize: 14,
  },
  demoIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIndicator: {
    right: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
  },
  leftIndicator: {
    left: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
  },
  upIndicator: {
    top: 20,
    left: '50%',
    transform: [{ translateX: -25 }],
  },
  downIndicator: {
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -25 }],
  },
  introImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introImage: {
    width: '80%',
    height: '80%',
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  navButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  primaryNavButton: {
    backgroundColor: '#ff5e3a',
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
  },
  primaryNavButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default QuickSwipeGuide;