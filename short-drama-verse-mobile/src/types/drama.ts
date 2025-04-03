// Navigation Types
export type RootStackParamList = {
  // Auth
  SignIn: undefined;
  SignUp: undefined;
  
  // Main
  MainTabs: undefined;
  
  // Content
  SeriesDetails: { seriesId: number };
  EpisodePlayer: { episodeId: number, seriesId: number };
  
  // User
  UserProfile: undefined;
  
  // Utility
  LoadingScreen: { message?: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

// API Response Types
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  genre: string[];
  coverImage: string;
  releaseDate: string;
  isPremium: boolean;
  director?: string;
  cast?: string[];
  averageRating: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  episodeNumber: number;
  duration: number;
  videoUrl: string;
  thumbnail?: string;
  isPremium: boolean;
  viewCount: number;
  releaseDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: string | null;
  isAdmin: boolean | null;
  coinBalance: number | null;
}

export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  addedAt: string;
  series?: DramaSeries;
}

export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  progress: number;
  completed: boolean;
  watchedAt: string;
  updatedAt: string;
  episode?: Episode & { series?: DramaSeries };
}

export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  user?: Pick<User, 'id' | 'username' | 'profilePicture'>;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'purchase' | 'subscription' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  transactionDate: string;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Error response
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}