// User type
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
  token?: string; // For authentication
}

// Drama Series type
export interface DramaSeries {
  id: number;
  title: string;
  description: string;
  genre: string[];
  coverImage: string;
  thumbnailImage: string;
  releaseYear: number;
  director: string;
  actors: string[];
  averageRating: number | null;
  totalEpisodes: number;
  isFeatured: boolean;
  isPopular: boolean;
  isTrending: boolean;
  createdAt: string;
}

// Episode type
export interface Episode {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  thumbnailImage: string;
  videoUrl: string;
  duration: number | null;
  episodeNumber: number;
  isFree: boolean;
  coinPrice: number | null;
  releaseDate: string;
  createdAt: string;
}

// Watchlist type
export interface Watchlist {
  id: number;
  userId: number;
  seriesId: number;
  createdAt: string;
  series?: DramaSeries;
}

// Watch History type
export interface WatchHistory {
  id: number;
  userId: number;
  episodeId: number;
  progress: number;
  completed: boolean;
  lastWatched: string;
  createdAt: string;
  episode?: Episode & { series?: DramaSeries };
}

// Rating type
export interface Rating {
  id: number;
  userId: number;
  seriesId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'username' | 'profilePicture'>;
}

// Transaction type
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  transactionType: 'PURCHASE' | 'DEPOSIT' | 'REFUND';
  episodeId: number | null;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

// Advertisement type
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
}

// Authentication credential types
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