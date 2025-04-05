/**
 * Recommendations Service
 * 
 * Service for generating personalized content recommendations.
 * Powers the recommendation engine and Quick-Swipe Content Accessibility Mode.
 */
import { contentService, WatchHistoryEntry } from './content';
import { contentSimilarityService } from './contentSimilarity';
import { DramaSeries } from '@/types/content';
import { UserPreferences } from '@/types/preferences';
import { analyticsService, AnalyticsEventType } from './analytics';

// Maximum number of items to consider from watch history
const MAX_HISTORY_ITEMS = 20;

// Maximum similarity score for collaborative filtering
const MAX_COLLABORATIVE_SCORE = 0.8;

// Types
export interface RecommendationItem {
  series: DramaSeries;
  score: number;
  reason: string;
}

export interface RecommendationOptions {
  watchHistory?: WatchHistoryEntry[];
  preferences?: UserPreferences;
  limit?: number;
  excludeIds?: number[];
  includeWatched?: boolean;
  strategyWeights?: {
    contentBased?: number;
    collaborative?: number;
    trending?: number;
    preference?: number;
  };
}

/**
 * Get personalized recommendations based on watch history, preferences and trending content
 */
async function getPersonalizedRecommendations(
  options: RecommendationOptions = {}
): Promise<RecommendationItem[]> {
  const {
    watchHistory = [],
    preferences = {} as UserPreferences,
    limit = 10,
    excludeIds = [],
    includeWatched = false,
    strategyWeights = {
      contentBased: 0.4,
      collaborative: 0.2,
      trending: 0.2,
      preference: 0.2
    }
  } = options;
  
  // Track recommendation request in analytics
  analyticsService.trackEvent(AnalyticsEventType.RECOMMENDATION_REQUEST, {
    has_watch_history: watchHistory.length > 0,
    has_preferences: Object.keys(preferences).length > 0,
    strategy_weights: strategyWeights
  });
  
  try {
    // Get all available series
    const allSeries = await contentService.getAllSeries();
    
    // Get already watched series ids
    const watchedSeriesIds = new Set(
      watchHistory.map(item => item.seriesId)
    );
    
    // Filter out excluded series and watched series (if not including watched)
    const candidateSeries = allSeries.filter(series => 
      !excludeIds.includes(series.id) && 
      (includeWatched || !watchedSeriesIds.has(series.id))
    );
    
    if (candidateSeries.length === 0) {
      return [];
    }
    
    // Calculate recommendations using different strategies
    const recommendations = await combineRecommendationStrategies(
      candidateSeries,
      watchHistory,
      preferences,
      strategyWeights
    );
    
    // Sort by score (descending) and take the top results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    analyticsService.trackEvent(AnalyticsEventType.ERROR, {
      feature: 'recommendations',
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * Combine different recommendation strategies with weighted scores
 */
async function combineRecommendationStrategies(
  candidateSeries: DramaSeries[],
  watchHistory: WatchHistoryEntry[],
  preferences: UserPreferences,
  weights: {
    contentBased?: number;
    collaborative?: number;
    trending?: number;
    preference?: number;
  }
): Promise<RecommendationItem[]> {
  const recommendations: { [key: number]: RecommendationItem } = {};
  
  // Content-based recommendations (based on watch history)
  if (weights.contentBased && watchHistory.length > 0) {
    const contentBasedRecs = await getContentBasedRecommendations(
      candidateSeries,
      watchHistory.slice(0, MAX_HISTORY_ITEMS)
    );
    
    contentBasedRecs.forEach(rec => {
      if (!recommendations[rec.series.id]) {
        recommendations[rec.series.id] = { ...rec, score: 0 };
      }
      recommendations[rec.series.id].score += rec.score * (weights.contentBased || 0);
    });
  }
  
  // Collaborative filtering recommendations (simulated)
  if (weights.collaborative) {
    const collaborativeRecs = await getCollaborativeRecommendations(
      candidateSeries,
      watchHistory
    );
    
    collaborativeRecs.forEach(rec => {
      if (!recommendations[rec.series.id]) {
        recommendations[rec.series.id] = { ...rec, score: 0 };
      }
      recommendations[rec.series.id].score += rec.score * (weights.collaborative || 0);
    });
  }
  
  // Trending recommendations
  if (weights.trending) {
    const trendingRecs = await getTrendingRecommendations(candidateSeries);
    
    trendingRecs.forEach(rec => {
      if (!recommendations[rec.series.id]) {
        recommendations[rec.series.id] = { ...rec, score: 0 };
      }
      recommendations[rec.series.id].score += rec.score * (weights.trending || 0);
    });
  }
  
  // Preference-based recommendations
  if (weights.preference && Object.keys(preferences).length > 0) {
    const preferenceRecs = getPreferenceBasedRecommendations(
      candidateSeries,
      preferences
    );
    
    preferenceRecs.forEach(rec => {
      if (!recommendations[rec.series.id]) {
        recommendations[rec.series.id] = { ...rec, score: 0 };
      }
      recommendations[rec.series.id].score += rec.score * (weights.preference || 0);
    });
  }
  
  // Convert object to array
  return Object.values(recommendations);
}

/**
 * Get content-based recommendations based on watch history
 */
async function getContentBasedRecommendations(
  candidateSeries: DramaSeries[],
  watchHistory: WatchHistoryEntry[]
): Promise<RecommendationItem[]> {
  // Get full series data for watched items
  const watchedSeriesPromises = watchHistory.map(
    async item => await contentService.getSeries(item.seriesId)
  );
  
  // Wait for all series data to be fetched
  const watchedSeries = (await Promise.all(watchedSeriesPromises))
    .filter(Boolean) as DramaSeries[];
  
  if (watchedSeries.length === 0) {
    return [];
  }
  
  // Calculate similarity scores for each candidate series
  const recommendations = candidateSeries.map(candidate => {
    // Don't recommend something already in watch history
    if (watchedSeries.some(series => series.id === candidate.id)) {
      return null;
    }
    
    // Calculate similarity to each watched series
    const similarityScores = watchedSeries.map(watched => ({
      score: contentSimilarityService.calculateSeriesSimilarity(watched, candidate),
      watched
    }));
    
    // Sort and get the most similar watched series
    similarityScores.sort((a, b) => b.score - a.score);
    const topSimilarity = similarityScores[0];
    
    if (!topSimilarity || topSimilarity.score <= 0.1) {
      return null;
    }
    
    // Find what made them similar for the reason
    let reason = 'Similar to content you watched';
    if (topSimilarity.watched.genres && 
        candidate.genres && 
        topSimilarity.watched.genres.some(g => candidate.genres?.includes(g))) {
      reason = `Similar to ${topSimilarity.watched.title} (${
        candidate.genres.filter(g => topSimilarity.watched.genres?.includes(g))[0]
      })`;
    } else if (topSimilarity.watched.creators && 
               candidate.creators && 
               topSimilarity.watched.creators.some(c => candidate.creators?.includes(c))) {
      reason = `By ${
        candidate.creators.filter(c => topSimilarity.watched.creators?.includes(c))[0]
      } (who made ${topSimilarity.watched.title})`;
    }
    
    return {
      series: candidate,
      score: topSimilarity.score,
      reason
    };
  });
  
  // Filter out nulls and return
  return recommendations.filter(Boolean) as RecommendationItem[];
}

/**
 * Get collaborative filtering recommendations (simulated)
 * In a real app, this would use a backend recommendation engine
 */
async function getCollaborativeRecommendations(
  candidateSeries: DramaSeries[],
  watchHistory: WatchHistoryEntry[]
): Promise<RecommendationItem[]> {
  // This is a simplified collaborative filtering simulation
  // In a real app, this would use data from similar users
  
  if (watchHistory.length === 0) {
    return [];
  }
  
  try {
    // Get "similar users" content (in a real app this would come from the backend)
    // Here we simulate it with trending content as a fallback
    const trendingSeries = await contentService.getTrendingContent(20);
    
    // Filter out content already in watch history
    const watchedIds = new Set(watchHistory.map(item => item.seriesId));
    const similarUsersSeries = trendingSeries.filter(
      series => !watchedIds.has(series.id)
    );
    
    // Calculate a "collaborative score" based on popularity
    // and some randomness to simulate collaborative filtering
    return similarUsersSeries.map(series => {
      const randomFactor = 0.5 + Math.random() * 0.5; // Random between 0.5 and 1.0
      const popularityScore = Math.min(
        MAX_COLLABORATIVE_SCORE,
        (series.popularity || 0.5) * randomFactor
      );
      
      return {
        series,
        score: popularityScore,
        reason: 'Popular with similar viewers'
      };
    });
  } catch (error) {
    console.error('Error getting collaborative recommendations:', error);
    return [];
  }
}

/**
 * Get trending content recommendations
 */
async function getTrendingRecommendations(
  candidateSeries: DramaSeries[]
): Promise<RecommendationItem[]> {
  try {
    // Get trending series from content service
    const trendingSeries = await contentService.getTrendingContent(20);
    
    // Map trending series to candidates with scores
    return candidateSeries
      .filter(candidate => 
        trendingSeries.some(trending => trending.id === candidate.id)
      )
      .map(candidate => {
        const trendingMatch = trendingSeries.find(t => t.id === candidate.id);
        const popularityScore = trendingMatch?.popularity || 0.5;
        
        return {
          series: candidate,
          score: popularityScore,
          reason: 'Trending now'
        };
      });
  } catch (error) {
    console.error('Error getting trending recommendations:', error);
    return [];
  }
}

/**
 * Get preference-based recommendations
 */
function getPreferenceBasedRecommendations(
  candidateSeries: DramaSeries[],
  preferences: UserPreferences
): RecommendationItem[] {
  if (Object.keys(preferences).length === 0) {
    return [];
  }
  
  // Use custom weights based on user preferences
  const weights = contentSimilarityService.getCustomWeights(preferences);
  
  // Calculate preference similarity scores
  return candidateSeries.map(candidate => {
    const similarityScore = contentSimilarityService.calculatePreferenceSimilarity(
      preferences,
      candidate,
      weights
    );
    
    if (similarityScore <= 0.1) {
      return null;
    }
    
    // Generate a reason based on which preference matched
    let reason = 'Matches your preferences';
    
    if (preferences.preferredGenres && candidate.genres && 
        preferences.preferredGenres.some(g => candidate.genres?.includes(g))) {
      reason = `Matches your ${
        candidate.genres.filter(g => preferences.preferredGenres?.includes(g))[0]
      } preference`;
    } else if (preferences.preferredLanguages && candidate.language && 
              preferences.preferredLanguages.includes(candidate.language)) {
      reason = `In your preferred language: ${candidate.language}`;
    }
    
    return {
      series: candidate,
      score: similarityScore,
      reason
    };
  }).filter(Boolean) as RecommendationItem[];
}

/**
 * Get similar content to a specific series
 */
async function getSimilarSeries(
  seriesId: number,
  limit: number = 10
): Promise<RecommendationItem[]> {
  try {
    // Get the source series
    const sourceSeries = await contentService.getSeries(seriesId);
    if (!sourceSeries) {
      throw new Error(`Series with ID ${seriesId} not found`);
    }
    
    // Get all series
    const allSeries = await contentService.getAllSeries();
    
    // Calculate similarity scores
    const similarSeries = allSeries
      .filter(series => series.id !== seriesId) // Exclude the source series
      .map(series => {
        const similarityScore = contentSimilarityService.calculateSeriesSimilarity(
          sourceSeries,
          series
        );
        
        // Generate a reason based on what made them similar
        let reason = 'Similar content';
        
        if (sourceSeries.genres && series.genres && 
            sourceSeries.genres.some(g => series.genres?.includes(g))) {
          reason = `Similar ${
            series.genres.filter(g => sourceSeries.genres?.includes(g))[0]
          } content`;
        } else if (sourceSeries.creators && series.creators && 
                  sourceSeries.creators.some(c => series.creators?.includes(c))) {
          const creator = series.creators.filter(c => sourceSeries.creators?.includes(c))[0];
          reason = creator ? `Also by ${creator}` : reason;
        }
        
        return {
          series,
          score: similarityScore,
          reason
        };
      })
      .filter(item => item.score > 0.1) // Only include reasonably similar items
      .sort((a, b) => b.score - a.score) // Sort by similarity (descending)
      .slice(0, limit); // Take only the requested number of items
    
    return similarSeries;
  } catch (error) {
    console.error(`Error getting similar series for ${seriesId}:`, error);
    analyticsService.trackEvent(AnalyticsEventType.ERROR, {
      feature: 'similar_series',
      series_id: seriesId,
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

// Export the recommendations service
export const recommendationsService = {
  getPersonalizedRecommendations,
  getSimilarSeries
};