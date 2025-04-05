/**
 * Custom Animation Player
 * 
 * A component that renders basic animations for onboarding in development environment.
 * In the actual mobile app, this would be replaced with Lottie animations.
 */
import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

interface AnimationProps {
  animationSource: any;
  autoPlay?: boolean;
  loop?: boolean;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'center';
}

const CustomAnimationPlayer: React.FC<AnimationProps> = ({
  animationSource,
  autoPlay = true,
  loop = true,
  style,
  resizeMode = 'contain'
}) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // In a real implementation, we would parse the Lottie JSON
    // Here we just simulate the animation with placeholder data
    setAnimationData({
      type: animationSource?.id || 'welcome',
      color: getColorForAnimation(animationSource?.id)
    });
  }, [animationSource]);

  useEffect(() => {
    if (animationData && autoPlay) {
      playAnimation();
    }
    return () => {
      stopAnimation();
    };
  }, [animationData, autoPlay]);

  const getColorForAnimation = (id?: string): string => {
    switch(id) {
      case 'welcome': return '#F72585';
      case 'discover': return '#4361EE';
      case 'watch': return '#4CC9F0';
      case 'subscribe': return '#7209B7';
      case 'start': return '#3A0CA3';
      default: return '#F72585';
    }
  };

  const playAnimation = () => {
    stopAnimation();
    animation.current = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      { iterations: loop ? -1 : 1 }
    );
    animation.current.start();
  };

  const stopAnimation = () => {
    if (animation.current) {
      animation.current.stop();
      animation.current = null;
    }
    animatedValue.setValue(0);
  };

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1]
  });

  const renderAnimation = () => {
    if (!animationData) return null;

    // Return a simple animated shape based on animation type
    switch(animationData.type) {
      case 'welcome':
        return <WelcomeAnimation color={animationData.color} animated={{ rotate, scale }} />;
      case 'discover':
        return <DiscoverAnimation color={animationData.color} animated={{ rotate, scale }} />;
      case 'watch':
        return <WatchAnimation color={animationData.color} animated={{ rotate, scale }} />;
      case 'subscribe':
        return <SubscribeAnimation color={animationData.color} animated={{ rotate, scale }} />;
      case 'start':
        return <StartAnimation color={animationData.color} animated={{ rotate, scale }} />;
      default:
        return <WelcomeAnimation color={animationData.color} animated={{ rotate, scale }} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderAnimation()}
    </View>
  );
};

// Simple animation components for each onboarding screen
const WelcomeAnimation: React.FC<{color: string, animated: any}> = ({color, animated}) => (
  <Animated.View style={[
    styles.animationContainer,
    { transform: [{ rotate: animated.rotate }, { scale: animated.scale }] }
  ]}>
    <View style={[styles.circle, { backgroundColor: color }]} />
    <View style={[styles.star, { borderColor: '#fff' }]} />
  </Animated.View>
);

const DiscoverAnimation: React.FC<{color: string, animated: any}> = ({color, animated}) => (
  <Animated.View style={[
    styles.animationContainer,
    { transform: [{ rotate: animated.rotate }, { scale: animated.scale }] }
  ]}>
    <View style={[styles.rectangle, { backgroundColor: color }]} />
    <View style={[styles.magnifyingGlass, { borderColor: '#fff' }]} />
  </Animated.View>
);

const WatchAnimation: React.FC<{color: string, animated: any}> = ({color, animated}) => (
  <Animated.View style={[
    styles.animationContainer,
    { transform: [{ rotate: animated.rotate }, { scale: animated.scale }] }
  ]}>
    <View style={[styles.playButton, { borderColor: '#fff', borderLeftColor: color }]} />
    <View style={[styles.rectangle, { backgroundColor: 'rgba(255,255,255,0.2)', width: 120, height: 80 }]} />
  </Animated.View>
);

const SubscribeAnimation: React.FC<{color: string, animated: any}> = ({color, animated}) => (
  <Animated.View style={[
    styles.animationContainer,
    { transform: [{ rotate: animated.rotate }, { scale: animated.scale }] }
  ]}>
    <View style={[styles.rectangle, { backgroundColor: color, width: 120, height: 80 }]} />
    <View style={[styles.coin, { backgroundColor: '#FFD700', borderColor: '#fff' }]} />
  </Animated.View>
);

const StartAnimation: React.FC<{color: string, animated: any}> = ({color, animated}) => (
  <Animated.View style={[
    styles.animationContainer,
    { transform: [{ rotate: animated.rotate }, { scale: animated.scale }] }
  ]}>
    <View style={[styles.rocket, { borderBottomColor: color, borderLeftColor: 'transparent', borderRightColor: 'transparent' }]} />
    <View style={[styles.star, { borderColor: '#fff', transform: [{ rotate: '45deg' }] }]} />
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F72585',
  },
  rectangle: {
    width: 100,
    height: 60,
    backgroundColor: '#4361EE',
    borderRadius: 8,
  },
  magnifyingGlass: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#fff',
  },
  playButton: {
    width: 0,
    height: 0,
    borderTopWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 40,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
  },
  coin: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rocket: {
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 60,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: '#7209B7',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  star: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 5,
    borderWidth: 5,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
});

export default CustomAnimationPlayer;