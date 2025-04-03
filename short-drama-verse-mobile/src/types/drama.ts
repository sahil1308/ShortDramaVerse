import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: Date;
  isAdmin: boolean;
  coinBalance: number;
}

// Authentication Types
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  email: string;
  displayName?: string;
}

// Content Types
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  releaseYear: number;
  director: string;
  actors: string[];
  genre: string[];
  averageRating: number | null;
  episodeCount: number;
  isComplete: boolean;
  isExclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  videoUrl: string;
  duration: number | null;
  episodeNumber: number;
  season: number;
  isExclusive: boolean;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Interaction Types
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    profilePicture: string | null;
  };
}

export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  addedAt: Date;
  series?: DramaSeries;
}

export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  watchedAt: Date;
  progress: number;
  completed: boolean;
  episode?: Episode & {
    series?: DramaSeries;
  };
}

// Transaction Types
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  transactionType: 'purchase' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  meta: {
    episodeId?: number;
    seriesId?: number;
    packageId?: number;
  } | null;
}

// Advertisement Types
export interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'banner' | 'sidebar' | 'interstitial';
  active: boolean;
  startDate: Date;
  endDate: Date | null;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Loading: { message?: string };
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  SeriesDetails: { id: number };
  EpisodePlayer: { id: number };
  UserProfile: { id: number };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Search: { initialQuery?: string };
  Watchlist: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabsNavigationProp = BottomTabNavigationProp<MainTabsParamList>;