import { users, dramaSeries, episodes, channels, watchlists, watchHistory, subscriptions, coinTransactions } from "@shared/schema";
import type { User, InsertUser, DramaSeries, InsertDramaSeries, Episode, InsertEpisode, Channel, InsertChannel, Watchlist, InsertWatchlist, WatchHistory, InsertWatchHistory, Subscription, InsertSubscription, CoinTransaction, InsertCoinTransaction } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: number, coins: number): Promise<User | undefined>;
  
  // Drama series operations
  getDramaSeries(id: number): Promise<DramaSeries | undefined>;
  getAllDramaSeries(): Promise<DramaSeries[]>;
  getFeaturedDramaSeries(): Promise<DramaSeries[]>;
  getTrendingDramaSeries(): Promise<DramaSeries[]>;
  getPremiumDramaSeries(): Promise<DramaSeries[]>;
  getDramaSeriesByGenre(genre: string): Promise<DramaSeries[]>;
  createDramaSeries(dramaSeries: InsertDramaSeries): Promise<DramaSeries>;
  updateDramaSeries(id: number, dramaSeries: Partial<InsertDramaSeries>): Promise<DramaSeries | undefined>;
  deleteDramaSeries(id: number): Promise<boolean>;
  
  // Episode operations
  getEpisode(id: number): Promise<Episode | undefined>;
  getEpisodesBySeriesId(seriesId: number): Promise<Episode[]>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined>;
  deleteEpisode(id: number): Promise<boolean>;
  
  // Channel operations
  getChannel(id: number): Promise<Channel | undefined>;
  getAllChannels(): Promise<Channel[]>;
  getPopularChannels(limit: number): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  
  // Watchlist operations
  getUserWatchlist(userId: number): Promise<(Watchlist & { series: DramaSeries })[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, seriesId: number): Promise<boolean>;
  
  // Watch history operations
  getUserWatchHistory(userId: number): Promise<(WatchHistory & { episode: Episode, series: DramaSeries })[]>;
  updateWatchHistory(watchHistory: InsertWatchHistory): Promise<WatchHistory>;
  
  // Subscription operations
  getUserSubscriptions(userId: number): Promise<(Subscription & { channel: Channel })[]>;
  subscribeToChannel(subscription: InsertSubscription): Promise<Subscription>;
  unsubscribeFromChannel(userId: number, channelId: number): Promise<boolean>;
  
  // Coin transactions
  createCoinTransaction(transaction: InsertCoinTransaction): Promise<CoinTransaction>;
  getUserCoinTransactions(userId: number): Promise<CoinTransaction[]>;
  
  // Session store
  sessionStore: any; // Using 'any' to bypass SessionStore type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dramaSeries: Map<number, DramaSeries>;
  private episodes: Map<number, Episode>;
  private channels: Map<number, Channel>;
  private watchlists: Map<number, Watchlist>;
  private watchHistory: Map<number, WatchHistory>;
  private subscriptions: Map<number, Subscription>;
  private coinTransactions: Map<number, CoinTransaction>;
  
  sessionStore: any; // Using 'any' to bypass SessionStore type issues
  
  private userCurrentId: number;
  private dramaSeriesCurrentId: number;
  private episodeCurrentId: number;
  private channelCurrentId: number;
  private watchlistCurrentId: number;
  private watchHistoryCurrentId: number;
  private subscriptionCurrentId: number;
  private coinTransactionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.dramaSeries = new Map();
    this.episodes = new Map();
    this.channels = new Map();
    this.watchlists = new Map();
    this.watchHistory = new Map();
    this.subscriptions = new Map();
    this.coinTransactions = new Map();
    
    this.userCurrentId = 1;
    this.dramaSeriesCurrentId = 1;
    this.episodeCurrentId = 1;
    this.channelCurrentId = 1;
    this.watchlistCurrentId = 1;
    this.watchHistoryCurrentId = 1;
    this.subscriptionCurrentId = 1;
    this.coinTransactionCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "password123", // This will be hashed in auth.ts
      displayName: "Administrator",
      email: "admin@shortdramaverse.com",
      profileImage: "https://ui-avatars.com/api/?name=Admin&background=E50914&color=fff",
    }).then(user => {
      // Update the user to be an admin
      this.users.set(user.id, { ...user, isAdmin: true, coins: 1000, isPremium: true });
    });

    // Create a regular test user for easy login
    this.createUser({
      username: "testuser",
      password: "password123", // This will be hashed in auth.ts
      displayName: "Test User",
      email: "test@shortdramaverse.com",
      profileImage: "https://ui-avatars.com/api/?name=Test+User&background=3498db&color=fff",
    }).then(user => {
      // Provide some coins to test premium features
      this.users.set(user.id, { ...user, coins: 500 });
    });

    // Initialize example channels
    this._initializeExampleChannels();
  }
  
  // Initialize example channels
  private async _initializeExampleChannels() {
    const channels = [
      {
        name: "Drama Queens",
        description: "The best romantic drama series",
        logoUrl: "https://ui-avatars.com/api/?name=Drama+Queens&background=E50914&color=fff",
        followerCount: 1200000
      },
      {
        name: "K-Drama Hub",
        description: "Korean drama series from all genres",
        logoUrl: "https://ui-avatars.com/api/?name=K+Drama+Hub&background=0A84FF&color=fff",
        followerCount: 980000
      },
      {
        name: "Short Suspense",
        description: "Edge of your seat suspense dramas",
        logoUrl: "https://ui-avatars.com/api/?name=Short+Suspense&background=FFBE0B&color=fff",
        followerCount: 650000
      },
      {
        name: "Comedy Central",
        description: "Laugh out loud comedy dramas",
        logoUrl: "https://ui-avatars.com/api/?name=Comedy+Central&background=5856D6&color=fff",
        followerCount: 1500000
      },
      {
        name: "Action Shorts",
        description: "Action-packed drama series",
        logoUrl: "https://ui-avatars.com/api/?name=Action+Shorts&background=34C759&color=fff",
        followerCount: 890000
      }
    ];
    
    for (const channel of channels) {
      await this.createChannel(channel);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      coins: 250, 
      isPremium: false, 
      isAdmin: false,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserCoins(userId: number, coins: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, coins };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Drama series operations
  async getDramaSeries(id: number): Promise<DramaSeries | undefined> {
    return this.dramaSeries.get(id);
  }

  async getAllDramaSeries(): Promise<DramaSeries[]> {
    return Array.from(this.dramaSeries.values());
  }

  async getFeaturedDramaSeries(): Promise<DramaSeries[]> {
    return Array.from(this.dramaSeries.values()).filter(series => series.isFeatured);
  }

  async getTrendingDramaSeries(): Promise<DramaSeries[]> {
    return Array.from(this.dramaSeries.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }

  async getPremiumDramaSeries(): Promise<DramaSeries[]> {
    return Array.from(this.dramaSeries.values()).filter(series => series.isPremium);
  }

  async getDramaSeriesByGenre(genre: string): Promise<DramaSeries[]> {
    return Array.from(this.dramaSeries.values()).filter(series => 
      series.genre.includes(genre)
    );
  }

  async createDramaSeries(insertDramaSeries: InsertDramaSeries): Promise<DramaSeries> {
    const id = this.dramaSeriesCurrentId++;
    const now = new Date();
    const dramaSeries: DramaSeries = { ...insertDramaSeries, id, createdAt: now };
    this.dramaSeries.set(id, dramaSeries);
    return dramaSeries;
  }

  async updateDramaSeries(id: number, dramaSeries: Partial<InsertDramaSeries>): Promise<DramaSeries | undefined> {
    const existingSeries = await this.getDramaSeries(id);
    if (!existingSeries) return undefined;
    
    const updatedSeries = { ...existingSeries, ...dramaSeries };
    this.dramaSeries.set(id, updatedSeries);
    return updatedSeries;
  }

  async deleteDramaSeries(id: number): Promise<boolean> {
    return this.dramaSeries.delete(id);
  }

  // Episode operations
  async getEpisode(id: number): Promise<Episode | undefined> {
    return this.episodes.get(id);
  }

  async getEpisodesBySeriesId(seriesId: number): Promise<Episode[]> {
    return Array.from(this.episodes.values())
      .filter(episode => episode.seriesId === seriesId)
      .sort((a, b) => {
        if (a.seasonNumber !== b.seasonNumber) {
          return a.seasonNumber - b.seasonNumber;
        }
        return a.episodeNumber - b.episodeNumber;
      });
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    const id = this.episodeCurrentId++;
    const now = new Date();
    const episode: Episode = { ...insertEpisode, id, createdAt: now };
    this.episodes.set(id, episode);
    return episode;
  }

  async updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined> {
    const existingEpisode = await this.getEpisode(id);
    if (!existingEpisode) return undefined;
    
    const updatedEpisode = { ...existingEpisode, ...episode };
    this.episodes.set(id, updatedEpisode);
    return updatedEpisode;
  }

  async deleteEpisode(id: number): Promise<boolean> {
    return this.episodes.delete(id);
  }

  // Channel operations
  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getAllChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async getPopularChannels(limit: number): Promise<Channel[]> {
    return Array.from(this.channels.values())
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, limit);
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.channelCurrentId++;
    const now = new Date();
    const channel: Channel = { ...insertChannel, id, createdAt: now };
    this.channels.set(id, channel);
    return channel;
  }

  // Watchlist operations
  async getUserWatchlist(userId: number): Promise<(Watchlist & { series: DramaSeries })[]> {
    const watchlistItems = Array.from(this.watchlists.values())
      .filter(item => item.userId === userId);
    
    return watchlistItems.map(item => {
      const series = this.dramaSeries.get(item.seriesId);
      if (!series) throw new Error(`Series with ID ${item.seriesId} not found`);
      return { ...item, series };
    });
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    // Check if already in watchlist
    const existing = Array.from(this.watchlists.values()).find(
      item => item.userId === insertWatchlist.userId && item.seriesId === insertWatchlist.seriesId
    );
    
    if (existing) return existing;
    
    const id = this.watchlistCurrentId++;
    const now = new Date();
    const watchlist: Watchlist = { ...insertWatchlist, id, addedAt: now };
    this.watchlists.set(id, watchlist);
    return watchlist;
  }

  async removeFromWatchlist(userId: number, seriesId: number): Promise<boolean> {
    const watchlistItem = Array.from(this.watchlists.values()).find(
      item => item.userId === userId && item.seriesId === seriesId
    );
    
    if (!watchlistItem) return false;
    return this.watchlists.delete(watchlistItem.id);
  }

  // Watch history operations
  async getUserWatchHistory(userId: number): Promise<(WatchHistory & { episode: Episode, series: DramaSeries })[]> {
    const historyItems = Array.from(this.watchHistory.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
    
    return historyItems.map(item => {
      const episode = this.episodes.get(item.episodeId);
      if (!episode) throw new Error(`Episode with ID ${item.episodeId} not found`);
      
      const series = this.dramaSeries.get(episode.seriesId);
      if (!series) throw new Error(`Series with ID ${episode.seriesId} not found`);
      
      return { ...item, episode, series };
    });
  }

  async updateWatchHistory(insertWatchHistory: InsertWatchHistory): Promise<WatchHistory> {
    // Check if already in history
    const existing = Array.from(this.watchHistory.values()).find(
      item => item.userId === insertWatchHistory.userId && item.episodeId === insertWatchHistory.episodeId
    );
    
    const now = new Date();
    
    if (existing) {
      const updated: WatchHistory = { 
        ...existing, 
        progress: insertWatchHistory.progress, 
        isCompleted: insertWatchHistory.isCompleted,
        watchedAt: now
      };
      this.watchHistory.set(existing.id, updated);
      return updated;
    }
    
    const id = this.watchHistoryCurrentId++;
    const watchHistory: WatchHistory = { ...insertWatchHistory, id, watchedAt: now };
    this.watchHistory.set(id, watchHistory);
    return watchHistory;
  }

  // Subscription operations
  async getUserSubscriptions(userId: number): Promise<(Subscription & { channel: Channel })[]> {
    const subscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId);
    
    return subscriptions.map(sub => {
      const channel = this.channels.get(sub.channelId);
      if (!channel) throw new Error(`Channel with ID ${sub.channelId} not found`);
      return { ...sub, channel };
    });
  }

  async subscribeToChannel(insertSubscription: InsertSubscription): Promise<Subscription> {
    // Check if already subscribed
    const existing = Array.from(this.subscriptions.values()).find(
      sub => sub.userId === insertSubscription.userId && sub.channelId === insertSubscription.channelId
    );
    
    if (existing) return existing;
    
    const id = this.subscriptionCurrentId++;
    const now = new Date();
    const subscription: Subscription = { ...insertSubscription, id, subscribedAt: now };
    this.subscriptions.set(id, subscription);
    
    // Update channel follower count
    const channel = await this.getChannel(insertSubscription.channelId);
    if (channel) {
      const updatedChannel = { ...channel, followerCount: channel.followerCount + 1 };
      this.channels.set(channel.id, updatedChannel);
    }
    
    return subscription;
  }

  async unsubscribeFromChannel(userId: number, channelId: number): Promise<boolean> {
    const subscription = Array.from(this.subscriptions.values()).find(
      sub => sub.userId === userId && sub.channelId === channelId
    );
    
    if (!subscription) return false;
    
    const deleted = this.subscriptions.delete(subscription.id);
    
    // Update channel follower count
    if (deleted) {
      const channel = await this.getChannel(channelId);
      if (channel) {
        const updatedChannel = { 
          ...channel, 
          followerCount: Math.max(0, channel.followerCount - 1)
        };
        this.channels.set(channel.id, updatedChannel);
      }
    }
    
    return deleted;
  }

  // Coin transactions
  async createCoinTransaction(insertTransaction: InsertCoinTransaction): Promise<CoinTransaction> {
    const id = this.coinTransactionCurrentId++;
    const now = new Date();
    const transaction: CoinTransaction = { ...insertTransaction, id, transactionDate: now };
    this.coinTransactions.set(id, transaction);
    return transaction;
  }

  async getUserCoinTransactions(userId: number): Promise<CoinTransaction[]> {
    return Array.from(this.coinTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
  }
}

export const storage = new MemStorage();
