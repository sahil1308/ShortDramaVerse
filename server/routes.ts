import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertDramaSeriesSchema,
  insertEpisodeSchema,
  insertRatingSchema,
  insertWatchlistSchema,
  insertWatchHistorySchema,
  insertTransactionSchema,
  insertAdvertisementSchema
} from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);
  
  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  
  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };
  
  /*
   * Drama Series Routes
   */
  
  // Get all drama series
  app.get("/api/drama-series", async (req, res, next) => {
    try {
      // Handle optional genre query parameter
      const genre = req.query.genre as string | undefined;
      
      if (genre) {
        const series = await storage.getDramaSeriesByGenre(genre);
        res.json(series);
      } else {
        const series = await storage.getAllDramaSeries();
        res.json(series);
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Search drama series
  app.get("/api/drama-series/search", async (req, res, next) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchDramaSeries(query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });
  
  // Get drama series by ID
  app.get("/api/drama-series/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const series = await storage.getDramaSeries(id);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      res.json(series);
    } catch (error) {
      next(error);
    }
  });
  
  // Create drama series (admin only)
  app.post("/api/drama-series", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertDramaSeriesSchema.parse(req.body);
      const series = await storage.createDramaSeries(validatedData);
      res.status(201).json(series);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Update drama series (admin only)
  app.patch("/api/drama-series/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const series = await storage.getDramaSeries(id);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      const updatedSeries = await storage.updateDramaSeries(id, req.body);
      res.json(updatedSeries);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete drama series (admin only)
  app.delete("/api/drama-series/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const series = await storage.getDramaSeries(id);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      await storage.deleteDramaSeries(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  /*
   * Episode Routes
   */
  
  // Get episodes by series ID
  app.get("/api/drama-series/:seriesId/episodes", async (req, res, next) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      if (isNaN(seriesId)) {
        return res.status(400).json({ message: "Invalid series ID" });
      }
      
      const series = await storage.getDramaSeries(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      const episodes = await storage.getEpisodesBySeriesId(seriesId);
      res.json(episodes);
    } catch (error) {
      next(error);
    }
  });
  
  // Get episode by ID
  app.get("/api/episodes/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const episode = await storage.getEpisode(id);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.json(episode);
    } catch (error) {
      next(error);
    }
  });
  
  // Create episode (admin only)
  app.post("/api/episodes", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertEpisodeSchema.parse(req.body);
      
      // Verify series exists
      const series = await storage.getDramaSeries(validatedData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      const episode = await storage.createEpisode(validatedData);
      res.status(201).json(episode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Update episode (admin only)
  app.patch("/api/episodes/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const episode = await storage.getEpisode(id);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      const updatedEpisode = await storage.updateEpisode(id, req.body);
      res.json(updatedEpisode);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete episode (admin only)
  app.delete("/api/episodes/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const episode = await storage.getEpisode(id);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      await storage.deleteEpisode(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  /*
   * Watchlist Routes
   */
  
  // Get user's watchlist
  app.get("/api/watchlist", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const watchlist = await storage.getWatchlistByUserId(userId);
      res.json(watchlist);
    } catch (error) {
      next(error);
    }
  });
  
  // Add series to watchlist
  app.post("/api/watchlist", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertWatchlistSchema.parse({
        ...req.body,
        userId,
      });
      
      // Verify series exists
      const series = await storage.getDramaSeries(validatedData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      const watchlistItem = await storage.addToWatchlist(validatedData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Remove series from watchlist
  app.delete("/api/watchlist/:seriesId", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const seriesId = parseInt(req.params.seriesId);
      
      if (isNaN(seriesId)) {
        return res.status(400).json({ message: "Invalid series ID" });
      }
      
      // Check if in watchlist
      const isInWatchlist = await storage.isInWatchlist(userId, seriesId);
      if (!isInWatchlist) {
        return res.status(404).json({ message: "Series not found in watchlist" });
      }
      
      await storage.removeFromWatchlist(userId, seriesId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Check if series is in watchlist
  app.get("/api/watchlist/check/:seriesId", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const seriesId = parseInt(req.params.seriesId);
      
      if (isNaN(seriesId)) {
        return res.status(400).json({ message: "Invalid series ID" });
      }
      
      const isInWatchlist = await storage.isInWatchlist(userId, seriesId);
      res.json({ inWatchlist: isInWatchlist });
    } catch (error) {
      next(error);
    }
  });
  
  /*
   * Watch History Routes
   */
  
  // Get user's watch history
  app.get("/api/watch-history", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const watchHistory = await storage.getWatchHistoryByUserId(userId);
      res.json(watchHistory);
    } catch (error) {
      next(error);
    }
  });
  
  // Add or update watch history
  app.post("/api/watch-history", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertWatchHistorySchema.parse({
        ...req.body,
        userId,
      });
      
      // Verify episode exists
      const episode = await storage.getEpisode(validatedData.episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      // Check if episode is premium and user has paid
      if (episode.isPremium) {
        // If user hasn't paid and isn't an admin, deny access
        // In a real app, we would check transactions or subscriptions here
        if (!req.user!.isAdmin && req.user!.coinBalance < (episode.price || 0)) {
          return res.status(403).json({ 
            message: "Purchase required to view this premium episode",
            price: episode.price
          });
        }
      }
      
      const historyItem = await storage.addToWatchHistory(validatedData);
      res.status(201).json(historyItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  /*
   * Rating Routes
   */
  
  // Get ratings for a series
  app.get("/api/drama-series/:seriesId/ratings", async (req, res, next) => {
    try {
      const seriesId = parseInt(req.params.seriesId);
      if (isNaN(seriesId)) {
        return res.status(400).json({ message: "Invalid series ID" });
      }
      
      const series = await storage.getDramaSeries(seriesId);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      const ratings = await storage.getRatingsBySeriesId(seriesId);
      res.json(ratings);
    } catch (error) {
      next(error);
    }
  });
  
  // Add or update a rating
  app.post("/api/ratings", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertRatingSchema.parse({
        ...req.body,
        userId,
      });
      
      // Verify series exists
      const series = await storage.getDramaSeries(validatedData.seriesId);
      if (!series) {
        return res.status(404).json({ message: "Drama series not found" });
      }
      
      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Delete a rating
  app.delete("/api/ratings/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Ensure user owns the rating or is admin
      const rating = await storage.getRatingByUserAndSeries(req.user!.id, id);
      if (!rating && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteRating(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  /*
   * Coin System Routes
   */
  
  // Get user's coin balance
  app.get("/api/coins/balance", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ balance: user.coinBalance });
    } catch (error) {
      next(error);
    }
  });
  
  // Get user's transaction history
  app.get("/api/coins/transactions", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new transaction (eg. purchase coins)
  app.post("/api/coins/purchase", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId,
        transactionType: 'purchase',
      });
      
      const transaction = await storage.createTransaction(validatedData);
      
      // Get updated user
      const user = await storage.getUser(userId);
      res.status(201).json({
        transaction,
        newBalance: user?.coinBalance
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Purchase premium content
  app.post("/api/coins/purchase-content/:episodeId", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const episodeId = parseInt(req.params.episodeId);
      
      if (isNaN(episodeId)) {
        return res.status(400).json({ message: "Invalid episode ID" });
      }
      
      // Verify episode exists and is premium
      const episode = await storage.getEpisode(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      if (!episode.isPremium) {
        return res.status(400).json({ message: "Episode is not premium content" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough coins
      if (user.coinBalance < (episode.price || 0)) {
        return res.status(400).json({ 
          message: "Insufficient coins",
          required: episode.price,
          balance: user.coinBalance
        });
      }
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        amount: -(episode.price || 0),
        description: `Purchase of episode: ${episode.title}`,
        transactionType: 'content_buy',
        metadata: { episodeId },
      });
      
      // Get updated user
      const updatedUser = await storage.getUser(userId);
      res.status(201).json({
        transaction,
        newBalance: updatedUser?.coinBalance
      });
    } catch (error) {
      next(error);
    }
  });
  
  /*
   * Advertisement Routes
   */
  
  // Get active advertisements by placement
  app.get("/api/ads/:placement", async (req, res, next) => {
    try {
      const placement = req.params.placement;
      const ads = await storage.getActiveAdvertisements(placement);
      
      // If this was a real app, we would increment impressions here
      // for metrics tracking
      
      res.json(ads);
    } catch (error) {
      next(error);
    }
  });
  
  // Record ad click
  app.post("/api/ads/:id/click", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.incrementAdClicks(id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Record ad impression
  app.post("/api/ads/:id/impression", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.incrementAdImpressions(id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Create advertisement (admin only)
  app.post("/api/ads", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(validatedData);
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Update advertisement (admin only)
  app.patch("/api/ads/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const ad = await storage.updateAdvertisement(id, req.body);
      res.json(ad);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete advertisement (admin only)
  app.delete("/api/ads/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.deleteAdvertisement(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  /*
   * User Management Routes (Admin)
   */
  
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await Promise.all(
        Array.from({ length: 50 }, (_, i) => i + 1)
          .map(async (id) => {
            const user = await storage.getUser(id);
            return user;
          })
      );
      
      // Filter out undefined users and remove passwords
      const filteredUsers = users
        .filter(Boolean)
        .map(user => {
          const { password, ...userWithoutPassword } = user!;
          return userWithoutPassword;
        });
      
      res.json(filteredUsers);
    } catch (error) {
      next(error);
    }
  });
  
  // Update user (admin only)
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}