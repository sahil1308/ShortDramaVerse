/**
 * SwipeableCard Component
 * 
 * A card component that supports swipe gestures with animated transitions.
 * Forms the foundation of the Quick-Swipe Content Accessibility Mode.
 */
import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Animated, 
  PanResponder,
  Dimensions, 
  TouchableWithoutFeedback
} from 'react-native';
import { DramaSeries, Episode } from '@/types/content';
import { useTailwind } from 'tailwind-rn';

// Get screen dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Swipe threshold - how far user needs to swipe to trigger an action
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// Swipe out duration in milliseconds
const SWIPE_OUT_DURATION = 250;

// Card rotation factor - how much the card rotates when swiping
const ROTATION_FACTOR = 15;

export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right', 
  UP = 'up',
  DOWN = 'down',
  NONE = 'none'
}

interface SwipeableCardProps {
  content: DramaSeries | Episode;
  contentType: 'series' | 'episode';
  onSwipe: (direction: SwipeDirection, content: DramaSeries | Episode) => void;
  onTap?: (content: DramaSeries | Episode) => void;
  renderOverlay?: (direction: SwipeDirection) => React.ReactNode;
  showTags?: boolean;
  accessibilityHints?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ 
  content, 
  contentType,
  onSwipe, 
  onTap,
  renderOverlay,
  showTags = true,
  accessibilityHints = true
}) => {
  const tw = useTailwind();
  const position = useRef(new Animated.ValueXY()).current;
  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<SwipeDirection>(SwipeDirection.NONE);
  
  // Calculate rotation based on swipe position
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [`-${ROTATION_FACTOR}deg`, '0deg', `${ROTATION_FACTOR}deg`],
    extrapolate: 'clamp'
  });
  
  // Calculate opacity for directional indicators based on swipe position
  const rightIndicatorOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  const leftIndicatorOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  
  const upIndicatorOpacity = position.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  
  const downIndicatorOpacity = position.y.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  // Calculate opacity for accessibility hints based on swipe position
  const rightHintOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  const leftHintOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  
  const upHintOpacity = position.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  
  const downHintOpacity = position.y.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  // Create pan responder to handle swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      // Don't capture events if we're not the target of them
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // Determine swipe direction for visual feedback
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          if (gesture.dx > SWIPE_THRESHOLD / 3) {
            setCurrentSwipeDirection(SwipeDirection.RIGHT);
          } else if (gesture.dx < -SWIPE_THRESHOLD / 3) {
            setCurrentSwipeDirection(SwipeDirection.LEFT);
          } else {
            setCurrentSwipeDirection(SwipeDirection.NONE);
          }
        } else {
          if (gesture.dy > SWIPE_THRESHOLD / 3) {
            setCurrentSwipeDirection(SwipeDirection.DOWN);
          } else if (gesture.dy < -SWIPE_THRESHOLD / 3) {
            setCurrentSwipeDirection(SwipeDirection.UP);
          } else {
            setCurrentSwipeDirection(SwipeDirection.NONE);
          }
        }
      },
      onPanResponderRelease: (event, gesture) => {
        // Determine if we should complete the swipe based on distance
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe(SwipeDirection.RIGHT);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe(SwipeDirection.LEFT);
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          forceSwipe(SwipeDirection.UP);
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          forceSwipe(SwipeDirection.DOWN);
        } else {
          resetPosition();
        }
      }
    })
  ).current;
  
  // Complete a swipe with animation in the given direction
  const forceSwipe = (direction: SwipeDirection) => {
    let animationConfig: any = {
      toValue: { x: 0, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    };
    
    switch (direction) {
      case SwipeDirection.RIGHT:
        animationConfig.toValue = { x: SCREEN_WIDTH + 100, y: 0 };
        break;
      case SwipeDirection.LEFT:
        animationConfig.toValue = { x: -SCREEN_WIDTH - 100, y: 0 };
        break;
      case SwipeDirection.UP:
        animationConfig.toValue = { x: 0, y: -SCREEN_HEIGHT - 100 };
        break;
      case SwipeDirection.DOWN:
        animationConfig.toValue = { x: 0, y: SCREEN_HEIGHT + 100 };
        break;
    }
    
    Animated.timing(position, animationConfig).start(() => {
      setCurrentSwipeDirection(SwipeDirection.NONE);
      position.setValue({ x: 0, y: 0 });
      onSwipe(direction, content);
    });
  };
  
  // Reset card position with animation
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false
    }).start(() => {
      setCurrentSwipeDirection(SwipeDirection.NONE);
    });
  };
  
  // Handle tap gesture
  const handleTap = () => {
    if (onTap) {
      onTap(content);
    }
  };
  
  // Get series-specific or episode-specific data for display
  const getContentData = () => {
    if (contentType === 'series') {
      const series = content as DramaSeries;
      return {
        title: series.title,
        image: series.coverImage,
        description: series.description,
        tags: series.genres,
        details: [
          `${series.episodeCount} episodes`,
          `${series.episodeDuration} min`,
          series.language
        ]
      };
    } else {
      const episode = content as Episode;
      return {
        title: episode.title,
        image: episode.thumbnailImage,
        description: episode.description,
        tags: [],
        details: [
          `Episode ${episode.episodeNumber}`,
          `${Math.floor(episode.duration / 60)} min`,
          episode.isPremium ? 'Premium' : 'Free'
        ]
      };
    }
  };
  
  const contentData = getContentData();
  
  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate }
            ]
          }
        ]}
        {...panResponder.panHandlers}
        accessible={true}
        accessibilityLabel={`${contentType === 'series' ? 'Series' : 'Episode'}: ${contentData.title}`}
        accessibilityHint={accessibilityHints ? 
          "Swipe right to add to watchlist, left to dismiss, up for details, down to share" : 
          "Swipe to explore options"}
      >
        {/* Main image */}
        <Image
          source={{ uri: contentData.image }}
          style={styles.image}
          accessibilityIgnoresInvertColors={true}
        />
        
        {/* Content overlay */}
        <View style={styles.overlay}>
          {/* Title and details */}
          <View style={styles.contentInfo}>
            <Text style={styles.title} numberOfLines={2}>{contentData.title}</Text>
            
            {/* Details row */}
            <View style={styles.detailsRow}>
              {contentData.details.map((detail, index) => (
                <React.Fragment key={index}>
                  <Text style={styles.detailText}>{detail}</Text>
                  {index < contentData.details.length - 1 && (
                    <View style={styles.detailDot} />
                  )}
                </React.Fragment>
              ))}
            </View>
            
            {/* Tags/Genres */}
            {showTags && contentData.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {contentData.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Description */}
            <Text style={styles.description} numberOfLines={3}>
              {contentData.description}
            </Text>
          </View>
        </View>
        
        {/* Swipe direction indicators */}
        <Animated.View style={[styles.directionIndicator, styles.rightIndicator, { opacity: rightIndicatorOpacity }]}>
          <Text style={styles.indicatorText}>Watchlist</Text>
        </Animated.View>
        
        <Animated.View style={[styles.directionIndicator, styles.leftIndicator, { opacity: leftIndicatorOpacity }]}>
          <Text style={styles.indicatorText}>Skip</Text>
        </Animated.View>
        
        <Animated.View style={[styles.directionIndicator, styles.upIndicator, { opacity: upIndicatorOpacity }]}>
          <Text style={styles.indicatorText}>Details</Text>
        </Animated.View>
        
        <Animated.View style={[styles.directionIndicator, styles.downIndicator, { opacity: downIndicatorOpacity }]}>
          <Text style={styles.indicatorText}>Share</Text>
        </Animated.View>
        
        {/* Accessibility hints */}
        {accessibilityHints && (
          <>
            <Animated.View style={[styles.accessibilityHint, styles.rightHint, { opacity: rightHintOpacity }]}>
              <Text style={styles.hintText}>Add to Watchlist</Text>
            </Animated.View>
            
            <Animated.View style={[styles.accessibilityHint, styles.leftHint, { opacity: leftHintOpacity }]}>
              <Text style={styles.hintText}>Skip / Not Interested</Text>
            </Animated.View>
            
            <Animated.View style={[styles.accessibilityHint, styles.upHint, { opacity: upHintOpacity }]}>
              <Text style={styles.hintText}>View Details</Text>
            </Animated.View>
            
            <Animated.View style={[styles.accessibilityHint, styles.downHint, { opacity: downHintOpacity }]}>
              <Text style={styles.hintText}>Share</Text>
            </Animated.View>
          </>
        )}
        
        {/* Custom overlay rendering */}
        {renderOverlay && renderOverlay(currentSwipeDirection)}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    paddingTop: 40,
  },
  contentInfo: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
  },
  detailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginHorizontal: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  directionIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
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
    transform: [{ translateX: -40 }],
  },
  downIndicator: {
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  indicatorText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  accessibilityHint: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightHint: {
    right: 40,
    top: '40%',
  },
  leftHint: {
    left: 40,
    top: '40%',
  },
  upHint: {
    top: 40,
    alignSelf: 'center',
  },
  downHint: {
    bottom: 100,
    alignSelf: 'center',
  },
  hintText: {
    color: '#fff',
    fontSize: 12,
  }
});

export default SwipeableCard;