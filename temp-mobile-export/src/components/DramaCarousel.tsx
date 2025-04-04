/**
 * DramaCarousel Component for ShortDramaVerse Mobile
 * 
 * This component renders a full-width carousel of featured drama series
 * with auto-play functionality.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  ListRenderItemInfo,
} from 'react-native';

// Components
import DramaCard, { DramaCardSkeleton } from './DramaCard';

// Types
import { DramaSeries } from '@/types/drama';

// Get screen dimensions
const { width } = Dimensions.get('window');

/**
 * Props for the DramaCarousel component
 */
interface DramaCarouselProps {
  data: DramaSeries[];                    // Drama series data
  onItemPress: (item: DramaSeries) => void; // Item press handler
  isLoading?: boolean;                    // Whether data is loading
  autoPlay?: boolean;                     // Whether to auto-play
  interval?: number;                      // Auto-play interval in ms
}

/**
 * DramaCarousel Component
 * 
 * Renders a full-width carousel of featured drama series with pagination
 * indicators and optional auto-play functionality.
 * 
 * @param props - DramaCarousel props
 * @returns DramaCarousel component
 */
const DramaCarousel: React.FC<DramaCarouselProps> = ({
  data,
  onItemPress,
  isLoading = false,
  autoPlay = true,
  interval = 5000,
}) => {
  // State for active slide index
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Ref for FlatList to enable programmatic scrolling
  const flatListRef = useRef<FlatList>(null);
  
  // Auto-play effect
  useEffect(() => {
    let autoPlayTimer: NodeJS.Timeout;
    
    if (autoPlay && data.length > 1) {
      autoPlayTimer = setInterval(() => {
        const nextIndex = (activeIndex + 1) % data.length;
        
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        
        setActiveIndex(nextIndex);
      }, interval);
    }
    
    return () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }
    };
  }, [autoPlay, interval, activeIndex, data.length]);
  
  // Handle scroll end for pagination
  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    
    setActiveIndex(newIndex);
  };
  
  // Render item function for FlatList
  const renderItem = ({ item }: ListRenderItemInfo<DramaSeries>) => (
    <View style={styles.slide}>
      <DramaCard
        item={item}
        type="featured"
        onPress={onItemPress}
      />
    </View>
  );
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.slide}>
          <DramaCardSkeleton type="featured" />
        </View>
      </View>
    );
  }
  
  // Handle empty data
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.slide}>
          <DramaCardSkeleton type="featured" />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => `carousel-${item.id}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />
      
      {/* Pagination indicators */}
      {data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => (
            <View
              key={`indicator-${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slide: {
    width,
    paddingHorizontal: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF6B6B',
    width: 12,
    height: 8,
    borderRadius: 4,
  },
});

export default DramaCarousel;