import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth types
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface ProfileUpdateFormData {
  displayName?: string;
  email?: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
  profilePicture?: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: string;
  isAdmin: boolean;
  coinBalance: number;
}

// Drama Series types
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  releaseYear: number;
  genre: string[];
  director: string;
  actors: string[];
  averageRating: number;
  isPremium: boolean;
  episodeCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

// Episode types
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  episodeNumber: number;
  thumbnailImage: string;
  videoUrl: string;
  duration: number;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  series?: DramaSeries;
}

// Watchlist types
export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  createdAt: string;
  series?: DramaSeries;
}

// Watch History types
export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  watchedAt: string;
  progress: number;
  completed: boolean;
  episode?: Episode;
}

// Rating types
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  value: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'username' | 'profilePicture'>;
}

// Transaction types
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  transactionType: 'purchase' | 'spend' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  reference?: string;
}

// Advertisement types
export interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

// Navigation types
export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  SeriesDetails: { id: number };
  EpisodePlayer: { id: number };
  UserProfile: { id: number };
  LoadingScreen: { message?: string };
  SignIn: undefined;
  SignUp: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabsParamList> = BottomTabScreenProps<
  MainTabsParamList,
  T
>;

// Declare the navigation prop types for easier access
export type HomeScreenNavigationProp = RootStackScreenProps<'MainTabs'>['navigation'];
export type SeriesDetailsNavigationProp = RootStackScreenProps<'SeriesDetails'>['navigation'];
export type EpisodePlayerNavigationProp = RootStackScreenProps<'EpisodePlayer'>['navigation'];