import { 
  User, InsertUser, 
  DramaSeries, InsertDramaSeries, 
  Episode, InsertEpisode,
  Watchlist, InsertWatchlist,
  WatchHistory, InsertWatchHistory,
  Rating, InsertRating,
  Transaction, InsertTransaction,
  Advertisement, InsertAdvertisement
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Drama series methods
  getDramaSeries(id: number): Promise<DramaSeries | undefined>;
  getAllDramaSeries(): Promise<DramaSeries[]>;
  getDramaSeriesByGenre(genre: string): Promise<DramaSeries[]>;
  createDramaSeries(series: InsertDramaSeries): Promise<DramaSeries>;
  updateDramaSeries(id: number, series: Partial<DramaSeries>): Promise<DramaSeries>;
  deleteDramaSeries(id: number): Promise<void>;
  searchDramaSeries(query: string): Promise<DramaSeries[]>;
  
  // Episode methods
  getEpisode(id: number): Promise<Episode | undefined>;
  getEpisodesBySeriesId(seriesId: number): Promise<Episode[]>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: number, episode: Partial<Episode>): Promise<Episode>;
  deleteEpisode(id: number): Promise<void>;
  
  // Watchlist methods
  getWatchlistByUserId(userId: number): Promise<(Watchlist & { series: DramaSeries })[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, seriesId: number): Promise<void>;
  isInWatchlist(userId: number, seriesId: number): Promise<boolean>;
  
  // Watch history methods
  getWatchHistoryByUserId(userId: number): Promise<(WatchHistory & { episode: Episode & { series: DramaSeries } })[]>;
  addToWatchHistory(history: InsertWatchHistory): Promise<WatchHistory>;
  updateWatchHistory(id: number, history: Partial<WatchHistory>): Promise<WatchHistory>;
  
  // Rating methods
  getRatingsBySeriesId(seriesId: number): Promise<(Rating & { user: Pick<User, 'id' | 'username' | 'profilePicture'> })[]>;
  getRatingByUserAndSeries(userId: number, seriesId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, rating: Partial<Rating>): Promise<Rating>;
  deleteRating(id: number): Promise<void>;
  
  // Transaction methods
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Advertisement methods
  getActiveAdvertisements(placement: string): Promise<Advertisement[]>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: number, ad: Partial<Advertisement>): Promise<Advertisement>;
  deleteAdvertisement(id: number): Promise<void>;
  incrementAdImpressions(id: number): Promise<void>;
  incrementAdClicks(id: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: any; // Using any type to avoid SessionStore type error
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private dramaSeries: DramaSeries[] = [];
  private episodes: Episode[] = [];
  private watchlists: Watchlist[] = [];
  private watchHistory: WatchHistory[] = [];
  private ratings: Rating[] = [];
  private transactions: Transaction[] = [];
  private advertisements: Advertisement[] = [];
  sessionStore: any; // Using any type to avoid SessionStore type error
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      coinBalance: 0,
      isAdmin: false,
      profilePicture: user.profilePicture || '',
      displayName: user.displayName || user.username,
      bio: user.bio || '',
    };
    this.users.push(newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error(`User with id ${id} not found`);
    
    this.users[index] = { ...this.users[index], ...user };
    return this.users[index];
  }
  
  // Drama series methods
  async getDramaSeries(id: number): Promise<DramaSeries | undefined> {
    return this.dramaSeries.find(series => series.id === id);
  }
  
  async getAllDramaSeries(): Promise<DramaSeries[]> {
    return this.dramaSeries;
  }
  
  async getDramaSeriesByGenre(genre: string): Promise<DramaSeries[]> {
    return this.dramaSeries.filter(series => series.genre.includes(genre));
  }
  
  async createDramaSeries(series: InsertDramaSeries): Promise<DramaSeries> {
    const id = this.dramaSeries.length > 0 ? Math.max(...this.dramaSeries.map(s => s.id)) + 1 : 1;
    const newSeries: DramaSeries = {
      ...series,
      id,
      averageRating: 0,
    };
    this.dramaSeries.push(newSeries);
    return newSeries;
  }
  
  async updateDramaSeries(id: number, series: Partial<DramaSeries>): Promise<DramaSeries> {
    const index = this.dramaSeries.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Drama series with id ${id} not found`);
    
    this.dramaSeries[index] = { ...this.dramaSeries[index], ...series };
    return this.dramaSeries[index];
  }
  
  async deleteDramaSeries(id: number): Promise<void> {
    const index = this.dramaSeries.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Drama series with id ${id} not found`);
    
    this.dramaSeries.splice(index, 1);
    
    // Delete related episodes
    this.episodes = this.episodes.filter(episode => episode.seriesId !== id);
    
    // Delete related watchlists
    this.watchlists = this.watchlists.filter(watchlist => watchlist.seriesId !== id);
    
    // Delete related ratings
    this.ratings = this.ratings.filter(rating => rating.seriesId !== id);
  }
  
  async searchDramaSeries(query: string): Promise<DramaSeries[]> {
    const lowerQuery = query.toLowerCase();
    return this.dramaSeries.filter(series => 
      series.title.toLowerCase().includes(lowerQuery) || 
      series.description.toLowerCase().includes(lowerQuery) ||
      series.genre.some(g => g.toLowerCase().includes(lowerQuery)) ||
      (series.actors && series.actors.some(a => a.toLowerCase().includes(lowerQuery))) ||
      (series.director && series.director.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Episode methods
  async getEpisode(id: number): Promise<Episode | undefined> {
    return this.episodes.find(episode => episode.id === id);
  }
  
  async getEpisodesBySeriesId(seriesId: number): Promise<Episode[]> {
    return this.episodes.filter(episode => episode.seriesId === seriesId)
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
  }
  
  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const id = this.episodes.length > 0 ? Math.max(...this.episodes.map(e => e.id)) + 1 : 1;
    const newEpisode: Episode = {
      ...episode,
      id,
    };
    this.episodes.push(newEpisode);
    return newEpisode;
  }
  
  async updateEpisode(id: number, episode: Partial<Episode>): Promise<Episode> {
    const index = this.episodes.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Episode with id ${id} not found`);
    
    this.episodes[index] = { ...this.episodes[index], ...episode };
    return this.episodes[index];
  }
  
  async deleteEpisode(id: number): Promise<void> {
    const index = this.episodes.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Episode with id ${id} not found`);
    
    this.episodes.splice(index, 1);
    
    // Delete related watch history
    this.watchHistory = this.watchHistory.filter(history => history.episodeId !== id);
  }
  
  // Watchlist methods
  async getWatchlistByUserId(userId: number): Promise<(Watchlist & { series: DramaSeries })[]> {
    return this.watchlists
      .filter(watchlist => watchlist.userId === userId)
      .map(watchlist => {
        const series = this.dramaSeries.find(s => s.id === watchlist.seriesId);
        if (!series) throw new Error(`Drama series with id ${watchlist.seriesId} not found`);
        return { ...watchlist, series };
      });
  }
  
  async addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist> {
    // Check if already in watchlist
    const existing = this.watchlists.find(
      w => w.userId === watchlist.userId && w.seriesId === watchlist.seriesId
    );
    if (existing) return existing;
    
    const id = this.watchlists.length > 0 ? Math.max(...this.watchlists.map(w => w.id)) + 1 : 1;
    const newWatchlist: Watchlist = {
      ...watchlist,
      id,
      addedAt: new Date(),
    };
    this.watchlists.push(newWatchlist);
    return newWatchlist;
  }
  
  async removeFromWatchlist(userId: number, seriesId: number): Promise<void> {
    const index = this.watchlists.findIndex(
      w => w.userId === userId && w.seriesId === seriesId
    );
    if (index === -1) throw new Error(`Watchlist entry not found`);
    
    this.watchlists.splice(index, 1);
  }
  
  async isInWatchlist(userId: number, seriesId: number): Promise<boolean> {
    return this.watchlists.some(
      w => w.userId === userId && w.seriesId === seriesId
    );
  }
  
  // Watch history methods
  async getWatchHistoryByUserId(userId: number): Promise<(WatchHistory & { episode: Episode & { series: DramaSeries } })[]> {
    return this.watchHistory
      .filter(history => history.userId === userId)
      .map(history => {
        const episode = this.episodes.find(e => e.id === history.episodeId);
        if (!episode) throw new Error(`Episode with id ${history.episodeId} not found`);
        
        const series = this.dramaSeries.find(s => s.id === episode.seriesId);
        if (!series) throw new Error(`Drama series with id ${episode.seriesId} not found`);
        
        return {
          ...history,
          episode: {
            ...episode,
            series,
          },
        };
      });
  }
  
  async addToWatchHistory(history: InsertWatchHistory): Promise<WatchHistory> {
    // Check if already in watch history
    const existing = this.watchHistory.find(
      h => h.userId === history.userId && h.episodeId === history.episodeId
    );
    
    if (existing) {
      // Update existing record
      return this.updateWatchHistory(existing.id, history);
    }
    
    const id = this.watchHistory.length > 0 ? Math.max(...this.watchHistory.map(h => h.id)) + 1 : 1;
    const newHistory: WatchHistory = {
      ...history,
      id,
      watchedAt: new Date(),
      completed: history.completed || false,
      progress: history.progress || 0,
    };
    this.watchHistory.push(newHistory);
    return newHistory;
  }
  
  async updateWatchHistory(id: number, history: Partial<WatchHistory>): Promise<WatchHistory> {
    const index = this.watchHistory.findIndex(h => h.id === id);
    if (index === -1) throw new Error(`Watch history entry with id ${id} not found`);
    
    this.watchHistory[index] = {
      ...this.watchHistory[index],
      ...history,
      watchedAt: new Date(),
    };
    return this.watchHistory[index];
  }
  
  // Rating methods
  async getRatingsBySeriesId(seriesId: number): Promise<(Rating & { user: Pick<User, 'id' | 'username' | 'profilePicture'> })[]> {
    return this.ratings
      .filter(rating => rating.seriesId === seriesId)
      .map(rating => {
        const user = this.users.find(u => u.id === rating.userId);
        if (!user) throw new Error(`User with id ${rating.userId} not found`);
        
        return {
          ...rating,
          user: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
        };
      });
  }
  
  async getRatingByUserAndSeries(userId: number, seriesId: number): Promise<Rating | undefined> {
    return this.ratings.find(
      r => r.userId === userId && r.seriesId === seriesId
    );
  }
  
  async createRating(rating: InsertRating): Promise<Rating> {
    // Check if user has already rated this series
    const existing = await this.getRatingByUserAndSeries(rating.userId, rating.seriesId);
    if (existing) {
      // Update existing rating
      return this.updateRating(existing.id, rating);
    }
    
    const id = this.ratings.length > 0 ? Math.max(...this.ratings.map(r => r.id)) + 1 : 1;
    const newRating: Rating = {
      ...rating,
      id,
      createdAt: new Date(),
    };
    this.ratings.push(newRating);
    
    // Update drama series average rating
    await this.updateSeriesAverageRating(rating.seriesId);
    
    return newRating;
  }
  
  async updateRating(id: number, rating: Partial<Rating>): Promise<Rating> {
    const index = this.ratings.findIndex(r => r.id === id);
    if (index === -1) throw new Error(`Rating with id ${id} not found`);
    
    this.ratings[index] = { ...this.ratings[index], ...rating };
    
    // Update drama series average rating
    await this.updateSeriesAverageRating(this.ratings[index].seriesId);
    
    return this.ratings[index];
  }
  
  async deleteRating(id: number): Promise<void> {
    const index = this.ratings.findIndex(r => r.id === id);
    if (index === -1) throw new Error(`Rating with id ${id} not found`);
    
    const seriesId = this.ratings[index].seriesId;
    this.ratings.splice(index, 1);
    
    // Update drama series average rating
    await this.updateSeriesAverageRating(seriesId);
  }
  
  private async updateSeriesAverageRating(seriesId: number): Promise<void> {
    const seriesRatings = this.ratings.filter(r => r.seriesId === seriesId);
    const seriesIndex = this.dramaSeries.findIndex(s => s.id === seriesId);
    
    if (seriesIndex === -1) throw new Error(`Drama series with id ${seriesId} not found`);
    
    if (seriesRatings.length === 0) {
      this.dramaSeries[seriesIndex].averageRating = 0;
    } else {
      const totalRating = seriesRatings.reduce((sum, r) => sum + r.rating, 0);
      this.dramaSeries[seriesIndex].averageRating = Math.round(totalRating / seriesRatings.length);
    }
  }
  
  // Transaction methods
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return this.transactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactions.length > 0 ? Math.max(...this.transactions.map(t => t.id)) + 1 : 1;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.push(newTransaction);
    
    // Update user coin balance
    const user = await this.getUser(transaction.userId);
    if (!user) throw new Error(`User with id ${transaction.userId} not found`);
    
    await this.updateUser(user.id, {
      coinBalance: user.coinBalance + transaction.amount,
    });
    
    return newTransaction;
  }
  
  // Advertisement methods
  async getActiveAdvertisements(placement: string): Promise<Advertisement[]> {
    const now = new Date();
    return this.advertisements.filter(ad => 
      ad.isActive && 
      ad.placement === placement &&
      new Date(ad.startDate) <= now &&
      new Date(ad.endDate) >= now
    );
  }
  
  async createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement> {
    const id = this.advertisements.length > 0 ? Math.max(...this.advertisements.map(a => a.id)) + 1 : 1;
    const newAd: Advertisement = {
      ...ad,
      id,
      impressions: 0,
      clicks: 0,
    };
    this.advertisements.push(newAd);
    return newAd;
  }
  
  async updateAdvertisement(id: number, ad: Partial<Advertisement>): Promise<Advertisement> {
    const index = this.advertisements.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Advertisement with id ${id} not found`);
    
    this.advertisements[index] = { ...this.advertisements[index], ...ad };
    return this.advertisements[index];
  }
  
  async deleteAdvertisement(id: number): Promise<void> {
    const index = this.advertisements.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Advertisement with id ${id} not found`);
    
    this.advertisements.splice(index, 1);
  }
  
  async incrementAdImpressions(id: number): Promise<void> {
    const index = this.advertisements.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Advertisement with id ${id} not found`);
    
    this.advertisements[index].impressions++;
  }
  
  async incrementAdClicks(id: number): Promise<void> {
    const index = this.advertisements.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Advertisement with id ${id} not found`);
    
    this.advertisements[index].clicks++;
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();