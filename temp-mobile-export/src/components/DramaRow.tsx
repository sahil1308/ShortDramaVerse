/**
 * DramaRow Component for ShortDramaVerse Mobile
 * 
 * This component renders a horizontal scrollable row of drama cards.
 * Used for displaying continue watching, trending series, etc.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ListRenderItemInfo,
} from 'react-native';

// Components
import DramaCard, { CardType, DramaCardSkeleton } from './DramaCard';

// Types
import { DramaSeries, Episode } from '@/types/drama';

/**
 * Props for the DramaRow component
 */
interface DramaRowProps {
  data: Array<DramaSeries | Episode>;      // Data items to display
  type: CardType;                          // Card layout style
  onItemPress: (item: any) => void;        // Item press handler
  isLoading?: boolean;                     // Whether data is loading 
  showProgress?: boolean;                  // Whether to show watch progress
  isEpisode?: boolean;                     // Whether items are episodes
}

/**
 * DramaRow Component
 * 
 * Renders a horizontal scrollable row of drama cards with consistent styling.
 * 
 * @param props - DramaRow props
 * @returns DramaRow component
 */
const DramaRow: React.FC<DramaRowProps> = ({
  data,
  type,
  onItemPress,
  isLoading = false,
  showProgress = false,
  isEpisode = false,
}) => {
  // Number of skeleton items to show during loading
  const skeletonCount = type === 'featured' ? 1 : 5;
  
  // Render item function for FlatList
  const renderItem = ({ item, index }: ListRenderItemInfo<DramaSeries | Episode>) => (
    <DramaCard 
      item={item}
      type={type}
      onPress={onItemPress}
      index={index}
      showProgress={showProgress}
      isEpisode={isEpisode}
    />
  );
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <FlatList
        data={Array(skeletonCount).fill(0)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          type === 'featured' && styles.featuredContainer
        ]}
        renderItem={({ index }) => (
          <DramaCardSkeleton type={type} index={index} />
        )}
        keyExtractor={(_, index) => `skeleton-${index}`}
      />
    );
  }
  
  // Render actual data
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        type === 'featured' && styles.featuredContainer
      ]}
      renderItem={renderItem}
      keyExtractor={(item) => `drama-${item.id}`}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {Array(3).fill(0).map((_, index) => (
            <DramaCardSkeleton key={`empty-${index}`} type={type} index={index} />
          ))}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  featuredContainer: {
    paddingHorizontal: 16, 
    paddingVertical: 0,
  },
  emptyContainer: {
    flexDirection: 'row',
  },
});

export default DramaRow;