/**
 * Content Similarity Service
 * 
 * Service for calculating similarity between content items.
 * Used by the recommendation engine to find similar content.
 */
import { DramaSeries, Episode } from '@/types/content';
import { UserPreferences } from '@/types/preferences';

// Default weights for different factors
const DEFAULT_WEIGHTS = {
  genres: 0.40,         // Genre matching has high importance
  creators: 0.20,        // Creator matching has medium importance
  language: 0.15,        // Language matching has medium importance
  releaseYear: 0.05,     // Release year has low importance
  episodeCount: 0.05,    // Similar length series (number of episodes) has low importance
  episodeDuration: 0.05, // Similar episode duration has low importance
  tags: 0.10             // Tags have low-medium importance
};

// Similarity score range is 0.0 to 1.0
// 0.0 = completely different, 1.0 = identical

/**
 * Calculate similarity score between two drama series
 */
export function calculateSeriesSimilarity(
  seriesA: DramaSeries,
  seriesB: DramaSeries,
  weights = DEFAULT_WEIGHTS
): number {
  // Don't compare the same series
  if (seriesA.id === seriesB.id) {
    return 0;
  }
  
  let totalScore = 0;
  let appliedWeightSum = 0;
  
  // Compare genres
  if (seriesA.genres && seriesB.genres && weights.genres > 0) {
    const genreScore = calculateSetSimilarity(
      new Set(seriesA.genres), 
      new Set(seriesB.genres)
    );
    totalScore += genreScore * weights.genres;
    appliedWeightSum += weights.genres;
  }
  
  // Compare creators (directors, writers, etc.)
  if (seriesA.creators && seriesB.creators && weights.creators > 0) {
    const creatorScore = calculateSetSimilarity(
      new Set(seriesA.creators), 
      new Set(seriesB.creators)
    );
    totalScore += creatorScore * weights.creators;
    appliedWeightSum += weights.creators;
  }
  
  // Compare language
  if (seriesA.language && seriesB.language && weights.language > 0) {
    const languageScore = seriesA.language === seriesB.language ? 1.0 : 0.0;
    totalScore += languageScore * weights.language;
    appliedWeightSum += weights.language;
  }
  
  // Compare release year
  if (seriesA.releaseYear && seriesB.releaseYear && weights.releaseYear > 0) {
    // Calculate how close the years are (within a 10-year window)
    const yearDifference = Math.abs(seriesA.releaseYear - seriesB.releaseYear);
    const yearScore = Math.max(0, 1 - yearDifference / 10);
    totalScore += yearScore * weights.releaseYear;
    appliedWeightSum += weights.releaseYear;
  }
  
  // Compare episode count
  if (seriesA.episodeCount && seriesB.episodeCount && weights.episodeCount > 0) {
    // Calculate similarity in episode count (within a reasonable range)
    const episodeCountDifference = Math.abs(seriesA.episodeCount - seriesB.episodeCount);
    const maxEpisodes = Math.max(seriesA.episodeCount, seriesB.episodeCount);
    const episodeCountScore = Math.max(0, 1 - episodeCountDifference / maxEpisodes);
    totalScore += episodeCountScore * weights.episodeCount;
    appliedWeightSum += weights.episodeCount;
  }
  
  // Compare episode duration
  if (seriesA.episodeDuration && seriesB.episodeDuration && weights.episodeDuration > 0) {
    // Calculate similarity in episode duration (within a 30-minute window)
    const durationDifference = Math.abs(seriesA.episodeDuration - seriesB.episodeDuration);
    const durationScore = Math.max(0, 1 - durationDifference / 30);
    totalScore += durationScore * weights.episodeDuration;
    appliedWeightSum += weights.episodeDuration;
  }
  
  // Compare tags
  if (seriesA.tags && seriesB.tags && weights.tags > 0) {
    const tagScore = calculateSetSimilarity(
      new Set(seriesA.tags), 
      new Set(seriesB.tags)
    );
    totalScore += tagScore * weights.tags;
    appliedWeightSum += weights.tags;
  }
  
  // Normalize the score based on applied weights
  return appliedWeightSum > 0 ? totalScore / appliedWeightSum : 0;
}

/**
 * Calculate similarity between user preferences and a series
 */
export function calculatePreferenceSimilarity(
  preferences: UserPreferences,
  series: DramaSeries,
  weights = DEFAULT_WEIGHTS
): number {
  let totalScore = 0;
  let appliedWeightSum = 0;
  
  // Compare preferred genres
  if (preferences.preferredGenres && preferences.preferredGenres.length > 0 && 
      series.genres && series.genres.length > 0 && weights.genres > 0) {
    const genreScore = calculateSetSimilarity(
      new Set(preferences.preferredGenres), 
      new Set(series.genres)
    );
    totalScore += genreScore * weights.genres;
    appliedWeightSum += weights.genres;
  }
  
  // Compare preferred creators
  if (preferences.preferredCreators && preferences.preferredCreators.length > 0 && 
      series.creators && series.creators.length > 0 && weights.creators > 0) {
    const creatorScore = calculateSetSimilarity(
      new Set(preferences.preferredCreators), 
      new Set(series.creators)
    );
    totalScore += creatorScore * weights.creators;
    appliedWeightSum += weights.creators;
  }
  
  // Compare preferred languages
  if (preferences.preferredLanguages && preferences.preferredLanguages.length > 0 && 
      series.language && weights.language > 0) {
    const languageScore = preferences.preferredLanguages.includes(series.language) ? 1.0 : 0.0;
    totalScore += languageScore * weights.language;
    appliedWeightSum += weights.language;
  }
  
  // Compare tags if available
  if (preferences.preferredTags && preferences.preferredTags.length > 0 && 
      series.tags && series.tags.length > 0 && weights.tags > 0) {
    const tagScore = calculateSetSimilarity(
      new Set(preferences.preferredTags), 
      new Set(series.tags)
    );
    totalScore += tagScore * weights.tags;
    appliedWeightSum += weights.tags;
  }
  
  // Adjust score based on explicitly disliked genres
  if (preferences.dislikedGenres && preferences.dislikedGenres.length > 0 && 
      series.genres && series.genres.length > 0) {
    const dislikedGenresInSeries = series.genres.filter(genre => 
      preferences.dislikedGenres!.includes(genre)
    );
    
    // Penalize score for each disliked genre present
    if (dislikedGenresInSeries.length > 0) {
      const penaltyFactor = dislikedGenresInSeries.length / series.genres.length;
      totalScore = totalScore * (1 - penaltyFactor);
    }
  }
  
  // Normalize the score based on applied weights
  return appliedWeightSum > 0 ? totalScore / appliedWeightSum : 0;
}

/**
 * Calculate Jaccard similarity between two sets
 * Measures similarity as intersection divided by union
 */
export function calculateSetSimilarity<T>(setA: Set<T>, setB: Set<T>): number {
  if (setA.size === 0 && setB.size === 0) {
    return 0; // Both empty, no similarity to measure
  }
  
  // Calculate intersection size
  const intersection = new Set<T>();
  for (const item of setA) {
    if (setB.has(item)) {
      intersection.add(item);
    }
  }
  
  // Calculate union size
  const union = new Set<T>([...setA, ...setB]);
  
  // Jaccard similarity = size of intersection / size of union
  return intersection.size / union.size;
}

/**
 * Customizes similarity weights based on user preferences
 */
export function getCustomWeights(
  preferences: UserPreferences,
  baseWeights = DEFAULT_WEIGHTS
): typeof DEFAULT_WEIGHTS {
  const weights = { ...baseWeights };
  
  // Adjust weights based on user preferences strength
  // For example, if user has many preferred genres, increase genre weight
  if (preferences.preferredGenres && preferences.preferredGenres.length > 3) {
    weights.genres = Math.min(0.5, weights.genres * 1.25); // Increase but cap at 0.5
  }
  
  // If user has specific creator preferences, increase creator weight
  if (preferences.preferredCreators && preferences.preferredCreators.length > 0) {
    weights.creators = Math.min(0.3, weights.creators * 1.5); // Increase but cap at 0.3
  }
  
  // If user has language preferences, adjust language weight
  if (preferences.preferredLanguages && preferences.preferredLanguages.length === 1) {
    weights.language = Math.min(0.25, weights.language * 1.5); // Single language preference is stronger
  }
  
  // Normalize weights to ensure they sum to 1
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight !== 1) {
    Object.keys(weights).forEach(key => {
      weights[key as keyof typeof weights] /= totalWeight;
    });
  }
  
  return weights;
}

// Export the content similarity service
export const contentSimilarityService = {
  calculateSeriesSimilarity,
  calculatePreferenceSimilarity,
  calculateSetSimilarity,
  getCustomWeights
};