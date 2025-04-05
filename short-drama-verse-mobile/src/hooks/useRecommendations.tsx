/**
 * Recommendations Hook
 * 
 * Custom hook for accessing recommended content for the quick-swipe interface.
 * Combines personalized recommendations with trending content.
 */
import { useState, useEffect, useCallback } from 'react';
import { DramaSeries } from '@/types/content';
import { recommendationsService, RecommendationItem } from '@/services/recommendations';
import { contentService } from '@/services/content';
import { useAnonymousUser } from './useAnonymousUser';
import { useUserPreferences } from './useUserPreferences';
import { analyticsService, AnalyticsEventType } from '@/services/analytics';

// Maximum number of recommendations to load at once
const MAX_RECOMMENDATIONS = 20;

// How many items to consider "running low" and trigger a reload
const LOW_ITEM_THRESHOLD = 5;

/**
 * Hook for getting recommendations
 * Combines personalized recommendations with trending content
 */
export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Get user data and preferences
  const { user } = useAnonymousUser();
  const { preferences } = useUserPreferences();
  
  // Load recommendations
  const loadRecommendations = useCallback(async (refresh = false) => {
    try {
      setError(null);
      
      if (refresh) {
        setIsLoading(true);
        setRecommendations([]);
      }
      
      // Get personalized recommendations if we have user data
      let newRecommendations: RecommendationItem[] = [];
      
      if (user?.id) {
        try {
          // Get watch history
          const watchHistory = await contentService.getWatchHistory(10);
          
          // Get personalized recommendations
          newRecommendations = await recommendationsService.getPersonalizedRecommendations({
            watchHistory,
            preferences,
            limit: MAX_RECOMMENDATIONS
          });
          
          // Track recommendation impression
          analyticsService.trackEvent(AnalyticsEventType.RECOMMENDATION_IMPRESSION, {
            sections: [{
              type: 'personalized',
              count: newRecommendations.length
            }],
            source: 'quick_swipe'
          });
        } catch (err) {
          console.error('Error loading personalized recommendations:', err);
          // Fall back to trending if personalized fails
          newRecommendations = [];
        }
      }
      
      // Fall back to trending content if no personalized recommendations
      if (newRecommendations.length === 0) {
        try {
          const trending = await contentService.getTrendingContent(MAX_RECOMMENDATIONS);
          
          // Convert to recommendation items
          newRecommendations = trending.map(series => ({
            series,
            score: 1.0,
            reason: 'Trending now'
          }));
          
          // Track trending impression
          analyticsService.trackEvent(AnalyticsEventType.RECOMMENDATION_IMPRESSION, {
            sections: [{
              type: 'trending',
              count: newRecommendations.length
            }],
            source: 'quick_swipe'
          });
        } catch (err) {
          console.error('Error loading trending content:', err);
          throw err;
        }
      }
      
      if (refresh) {
        setRecommendations(newRecommendations);
      } else {
        // Filter out duplicates when adding more
        const existingIds = new Set(recommendations.map(item => item.series.id));
        const uniqueNewRecommendations = newRecommendations.filter(
          item => !existingIds.has(item.series.id)
        );
        
        setRecommendations(prevRecs => [...prevRecs, ...uniqueNewRecommendations]);
      }
      
      // Update hasMore flag
      setHasMore(newRecommendations.length >= LOW_ITEM_THRESHOLD);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err instanceof Error ? err : new Error('Failed to load recommendations'));
    } finally {
      setIsLoading(false);
    }
  }, [user, preferences, recommendations]);
  
  // Load more recommendations when running low
  const loadMore = useCallback(async () => {
    if (recommendations.length <= LOW_ITEM_THRESHOLD && hasMore && !isLoading) {
      await loadRecommendations(false);
    }
  }, [recommendations.length, hasMore, isLoading, loadRecommendations]);
  
  // Load initial recommendations
  useEffect(() => {
    loadRecommendations(true);
  }, [user?.id]);
  
  // Check if we need to load more
  useEffect(() => {
    loadMore();
  }, [recommendations.length, loadMore]);
  
  // Refresh recommendations
  const refresh = useCallback(async () => {
    await loadRecommendations(true);
  }, [loadRecommendations]);
  
  return {
    data: recommendations,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore
  };
}