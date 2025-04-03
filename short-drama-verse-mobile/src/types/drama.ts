import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// User-related types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  isAdmin: boolean;
  coinBalance: number;
  createdAt: string;
}

// Authentication response type
export interface AuthResponse {
  user: User;
  token: string;
}

// Drama series types
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  genre: string[];
  releaseYear: number;
  director: string;
  actors: string[];
  averageRating: number;
  totalEpisodes: number;
  isFeatured: boolean;
  createdAt: string;
}

// Episode types
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  videoUrl: string;
  duration: number;
  episodeNumber: number;
  isPremium: boolean;
  coinPrice: number;
  releaseDate: string;
  viewCount: number;
}

// Watchlist type
export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  addedAt: string;
  series?: DramaSeries;
}

// Watch history type
export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  progress: number;
  completed: boolean;
  lastWatched: string;
  episode?: Episode;
}

// Rating type
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

// Transaction type
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'purchase' | 'refill';
  description: string;
  createdAt: string;
  episodeId?: number;
  episode?: Episode;
}

// Advertisement type
export interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  active: boolean;
}

// Error type for API responses
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Navigation Types

// Root stack param list
export type RootStackParamList = {
  MainTabs: undefined;
  SignIn: undefined;
  SignUp: undefined;
  SeriesDetails: { seriesId: number };
  EpisodePlayer: { episodeId: number };
  UserProfile: { userId: number };
  LoadingScreen: { message?: string };
};

// Tab navigation param list
export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = 
  BottomTabScreenProps<TabParamList, T>;