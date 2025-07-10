/**
 * Content Service
 * 
 * This service handles content management, drama series data,
 * and content discovery for the ShortDramaVerse application.
 */

import { getUserPreferences } from './anonymousAuth';

export interface DramaContent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  genre: string[];
  language: string;
  rating: number;
  totalEpisodes: number;
  releaseDate: string;
  cast: string[];
  director: string;
  isFree: boolean;
  isPremium: boolean;
  tags: string[];
  viewCount: number;
  likeCount: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number;
  episodeNumber: number;
  seasonNumber: number;
  thumbnailUrl: string;
  videoUrl: string;
  isFree: boolean;
  releaseDate: string;
  viewCount: number;
  dramaId: string;
}

export interface SwipeableContent {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  dramaId: string;
  episodeId: string;
  genre: string[];
  rating: number;
  viewCount: number;
}

// Mock data for demonstration
const mockDramaContent: DramaContent[] = [
  {
    id: 'drama_1',
    title: 'Love in the Digital Age',
    description: 'A modern romance about two tech entrepreneurs who fall in love through a dating app, only to discover they\'re business rivals.',
    thumbnailUrl: 'https://example.com/drama1.jpg',
    duration: 25,
    genre: ['Romance', 'Comedy', 'Drama'],
    language: 'en',
    rating: 8.7,
    totalEpisodes: 12,
    releaseDate: '2024-01-15',
    cast: ['Emma Stone', 'Ryan Gosling', 'Michael Cera'],
    director: 'Sofia Coppola',
    isFree: true,
    isPremium: false,
    tags: ['trending', 'popular', 'binge-worthy'],
    viewCount: 1250000,
    likeCount: 89500,
    episodes: [
      {
        id: 'ep_1_1',
        title: 'First Swipe',
        description: 'Sarah downloads a dating app and matches with a mysterious entrepreneur.',
        duration: 25,
        episodeNumber: 1,
        seasonNumber: 1,
        thumbnailUrl: 'https://example.com/ep1.jpg',
        videoUrl: 'https://example.com/video1.mp4',
        isFree: true,
        releaseDate: '2024-01-15',
        viewCount: 500000,
        dramaId: 'drama_1',
      },
      {
        id: 'ep_1_2',
        title: 'Coffee and Code',
        description: 'The first date goes surprisingly well until they discover each other\'s companies.',
        duration: 27,
        episodeNumber: 2,
        seasonNumber: 1,
        thumbnailUrl: 'https://example.com/ep2.jpg',
        videoUrl: 'https://example.com/video2.mp4',
        isFree: false,
        releaseDate: '2024-01-22',
        viewCount: 450000,
        dramaId: 'drama_1',
      },
    ],
  },
  {
    id: 'drama_2',
    title: 'Midnight Detective',
    description: 'A brilliant detective works the night shift, solving crimes that happen after dark in the city that never sleeps.',
    thumbnailUrl: 'https://example.com/drama2.jpg',
    duration: 30,
    genre: ['Crime', 'Mystery', 'Thriller'],
    language: 'en',
    rating: 9.2,
    totalEpisodes: 8,
    releaseDate: '2024-02-01',
    cast: ['Benedict Cumberbatch', 'Lupita Nyong\'o', 'Oscar Isaac'],
    director: 'Denis Villeneuve',
    isFree: false,
    isPremium: true,
    tags: ['mystery', 'thriller', 'award-winning'],
    viewCount: 890000,
    likeCount: 78000,
    episodes: [
      {
        id: 'ep_2_1',
        title: 'The Night Shift',
        description: 'Detective Morgan starts her new assignment on the night shift and encounters her first mysterious case.',
        duration: 30,
        episodeNumber: 1,
        seasonNumber: 1,
        thumbnailUrl: 'https://example.com/ep2_1.jpg',
        videoUrl: 'https://example.com/video2_1.mp4',
        isFree: true,
        releaseDate: '2024-02-01',
        viewCount: 300000,
        dramaId: 'drama_2',
      },
    ],
  },
  {
    id: 'drama_3',
    title: 'Campus Chronicles',
    description: 'Follow a group of college students as they navigate friendship, love, and academic pressure in their final year.',
    thumbnailUrl: 'https://example.com/drama3.jpg',
    duration: 22,
    genre: ['Comedy', 'Drama', 'Youth'],
    language: 'en',
    rating: 8.1,
    totalEpisodes: 16,
    releaseDate: '2024-01-08',
    cast: ['Zendaya', 'Timothée Chalamet', 'Anya Taylor-Joy'],
    director: 'Greta Gerwig',
    isFree: true,
    isPremium: false,
    tags: ['youth', 'comedy', 'relatable'],
    viewCount: 2100000,
    likeCount: 156000,
    episodes: [
      {
        id: 'ep_3_1',
        title: 'Senior Year Blues',
        description: 'The gang faces the reality of their final year and upcoming graduation.',
        duration: 22,
        episodeNumber: 1,
        seasonNumber: 1,
        thumbnailUrl: 'https://example.com/ep3_1.jpg',
        videoUrl: 'https://example.com/video3_1.mp4',
        isFree: true,
        releaseDate: '2024-01-08',
        viewCount: 400000,
        dramaId: 'drama_3',
      },
    ],
  },
];

/**
 * Get featured dramas for the main carousel
 */
export const getFeaturedDramas = async (): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return top rated dramas
    return mockDramaContent
      .filter(drama => drama.rating >= 8.5)
      .sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Failed to get featured dramas:', error);
    return [];
  }
};

/**
 * Get popular dramas
 */
export const getPopularDramas = async (): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return most viewed dramas
    return mockDramaContent
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to get popular dramas:', error);
    return [];
  }
};

/**
 * Get personalized recommendations
 */
export const getRecommendations = async (userId: string): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Get user preferences
    const preferences = await getUserPreferences();
    
    // Filter content based on preferences
    let recommendations = mockDramaContent.filter(drama => {
      if (preferences.preferredGenres.length > 0) {
        return drama.genre.some(genre => preferences.preferredGenres.includes(genre));
      }
      return true;
    });
    
    // If no genre preferences, return popular content
    if (recommendations.length === 0) {
      recommendations = mockDramaContent.slice(0, 5);
    }
    
    return recommendations.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return mockDramaContent.slice(0, 3);
  }
};

/**
 * Get drama series by ID
 */
export const getDrama = async (dramaId: string): Promise<DramaContent | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const drama = mockDramaContent.find(d => d.id === dramaId);
    return drama || null;
  } catch (error) {
    console.error('Failed to get drama:', error);
    return null;
  }
};

/**
 * Get episode by drama ID and episode ID
 */
export const getDramaEpisode = async (dramaId: string, episodeId: string): Promise<Episode | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const drama = mockDramaContent.find(d => d.id === dramaId);
    if (!drama) return null;
    
    const episode = drama.episodes.find(ep => ep.id === episodeId);
    return episode || null;
  } catch (error) {
    console.error('Failed to get episode:', error);
    return null;
  }
};

/**
 * Get swipeable content for Quick Swipe feature
 */
export const getSwipeableContent = async (): Promise<SwipeableContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Convert dramas to swipeable format
    const swipeableContent: SwipeableContent[] = [];
    
    mockDramaContent.forEach(drama => {
      drama.episodes.forEach(episode => {
        swipeableContent.push({
          id: `${drama.id}_${episode.id}`,
          title: `${drama.title} - ${episode.title}`,
          description: episode.description,
          duration: episode.duration,
          thumbnailUrl: episode.thumbnailUrl,
          dramaId: drama.id,
          episodeId: episode.id,
          genre: drama.genre,
          rating: drama.rating,
          viewCount: episode.viewCount,
        });
      });
    });
    
    // Shuffle the content
    return swipeableContent.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Failed to get swipeable content:', error);
    return [];
  }
};

/**
 * Search dramas by query
 */
export const searchDramas = async (query: string): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const lowercaseQuery = query.toLowerCase();
    
    return mockDramaContent.filter(drama => 
      drama.title.toLowerCase().includes(lowercaseQuery) ||
      drama.description.toLowerCase().includes(lowercaseQuery) ||
      drama.genre.some(g => g.toLowerCase().includes(lowercaseQuery)) ||
      drama.cast.some(c => c.toLowerCase().includes(lowercaseQuery)) ||
      drama.director.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Failed to search dramas:', error);
    return [];
  }
};

/**
 * Get dramas by genre
 */
export const getDramasByGenre = async (genre: string): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockDramaContent.filter(drama => 
      drama.genre.includes(genre)
    );
  } catch (error) {
    console.error('Failed to get dramas by genre:', error);
    return [];
  }
};

/**
 * Get trending dramas
 */
export const getTrendingDramas = async (): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return mockDramaContent
      .filter(drama => drama.tags.includes('trending'))
      .sort((a, b) => b.viewCount - a.viewCount);
  } catch (error) {
    console.error('Failed to get trending dramas:', error);
    return [];
  }
};

/**
 * Get recently added dramas
 */
export const getRecentlyAddedDramas = async (): Promise<DramaContent[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return mockDramaContent
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 8);
  } catch (error) {
    console.error('Failed to get recently added dramas:', error);
    return [];
  }
};