import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertDramaSeriesSchema, insertEpisodeSchema, insertChannelSchema, insertWatchlistSchema, insertWatchHistorySchema, insertSubscriptionSchema, insertCoinTransactionSchema } from "@shared/schema";

// Helper middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
};

// Helper middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).send("Forbidden");
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Drama Series routes
  app.get("/api/dramas", async (req, res) => {
    try {
      const dramas = await storage.getAllDramaSeries();
      res.json(dramas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dramas" });
    }
  });

  app.get("/api/dramas/featured", async (req, res) => {
    try {
      const dramas = await storage.getFeaturedDramaSeries();
      res.json(dramas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured dramas" });
    }
  });

  app.get("/api/dramas/trending", async (req, res) => {
    try {
      const dramas = await storage.getTrendingDramaSeries();
      res.json(dramas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending dramas" });
    }
  });

  app.get("/api/dramas/premium", async (req, res) => {
    try {
      const dramas = await storage.getPremiumDramaSeries();
      res.json(dramas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch premium dramas" });
    }
  });

  app.get("/api/dramas/genre/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const dramas = await storage.getDramaSeriesByGenre(genre);
      res.json(dramas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dramas by genre" });
    }
  });

  app.get("/api/dramas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const drama = await storage.getDramaSeries(parseInt(id));
      if (!drama) {
        return res.status(404).json({ error: "Drama not found" });
      }
      res.json(drama);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drama" });
    }
  });

  app.post("/api/dramas", isAdmin, async (req, res) => {
    try {
      const validatedData = insertDramaSeriesSchema.parse(req.body);
      const drama = await storage.createDramaSeries(validatedData);
      res.status(201).json(drama);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create drama" });
    }
  });

  app.put("/api/dramas/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDramaSeriesSchema.partial().parse(req.body);
      const drama = await storage.updateDramaSeries(parseInt(id), validatedData);
      if (!drama) {
        return res.status(404).json({ error: "Drama not found" });
      }
      res.json(drama);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update drama" });
    }
  });

  app.delete("/api/dramas/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDramaSeries(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ error: "Drama not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete drama" });
    }
  });

  // Episode routes
  app.get("/api/dramas/:seriesId/episodes", async (req, res) => {
    try {
      const { seriesId } = req.params;
      const episodes = await storage.getEpisodesBySeriesId(parseInt(seriesId));
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });

  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const episode = await storage.getEpisode(parseInt(id));
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch episode" });
    }
  });

  app.post("/api/episodes", isAdmin, async (req, res) => {
    try {
      const validatedData = insertEpisodeSchema.parse(req.body);
      const episode = await storage.createEpisode(validatedData);
      res.status(201).json(episode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create episode" });
    }
  });

  app.put("/api/episodes/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEpisodeSchema.partial().parse(req.body);
      const episode = await storage.updateEpisode(parseInt(id), validatedData);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update episode" });
    }
  });

  app.delete("/api/episodes/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEpisode(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete episode" });
    }
  });

  // Channel routes
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getAllChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  app.get("/api/channels/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const channels = await storage.getPopularChannels(limit);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular channels" });
    }
  });

  app.get("/api/channels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const channel = await storage.getChannel(parseInt(id));
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch channel" });
    }
  });

  app.post("/api/channels", isAdmin, async (req, res) => {
    try {
      const validatedData = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(validatedData);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create channel" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const watchlist = await storage.getUserWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertWatchlistSchema.parse({ ...req.body, userId });
      const watchlist = await storage.addToWatchlist(validatedData);
      res.status(201).json(watchlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:seriesId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { seriesId } = req.params;
      const deleted = await storage.removeFromWatchlist(userId, parseInt(seriesId));
      if (!deleted) {
        return res.status(404).json({ error: "Item not found in watchlist" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  // Watch history routes
  app.get("/api/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const history = await storage.getUserWatchHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watch history" });
    }
  });

  app.post("/api/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertWatchHistorySchema.parse({ ...req.body, userId });
      const history = await storage.updateWatchHistory(validatedData);
      res.status(201).json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update watch history" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertSubscriptionSchema.parse({ ...req.body, userId });
      const subscription = await storage.subscribeToChannel(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to subscribe to channel" });
    }
  });

  app.delete("/api/subscriptions/:channelId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { channelId } = req.params;
      const deleted = await storage.unsubscribeFromChannel(userId, parseInt(channelId));
      if (!deleted) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to unsubscribe from channel" });
    }
  });

  // Coin transaction routes
  app.get("/api/coins/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getUserCoinTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch coin transactions" });
    }
  });

  app.post("/api/coins/purchase", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      // Create transaction record
      const validatedData = insertCoinTransactionSchema.parse({
        userId,
        amount,
        description: `Purchased ${amount} coins`,
        transactionType: "purchase",
        status: "completed"
      });
      
      const transaction = await storage.createCoinTransaction(validatedData);
      
      // Update user's coin balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = await storage.updateUserCoins(userId, user.coins + amount);
      
      res.status(201).json({ transaction, user: updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to purchase coins" });
    }
  });

  app.post("/api/coins/unlock-premium", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { seriesId } = req.body;
      
      // Validate series exists and is premium
      const series = await storage.getDramaSeries(seriesId);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      
      if (!series.isPremium) {
        return res.status(400).json({ error: "This content is not premium" });
      }
      
      // Check if user has enough coins
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.coins < series.coinPrice) {
        return res.status(400).json({ error: "Insufficient coins" });
      }
      
      // Create transaction record
      const validatedData = insertCoinTransactionSchema.parse({
        userId,
        amount: -series.coinPrice,
        description: `Unlocked premium content: ${series.title}`,
        transactionType: "content_unlock",
        status: "completed"
      });
      
      const transaction = await storage.createCoinTransaction(validatedData);
      
      // Update user's coin balance
      const updatedUser = await storage.updateUserCoins(userId, user.coins - series.coinPrice);
      
      res.status(201).json({ transaction, user: updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to unlock premium content" });
    }
  });

  // Analytics routes (admin only)
  app.get("/api/admin/analytics/users", isAdmin, async (req, res) => {
    try {
      // In a real app, this would query for user analytics
      // For now, return mock data
      res.json({
        totalUsers: 100,
        newUsersToday: 5,
        premiumUsers: 20,
        activeUsers: 45
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  app.get("/api/admin/analytics/content", isAdmin, async (req, res) => {
    try {
      // In a real app, this would query for content analytics
      // For now, return mock data
      res.json({
        totalDramas: 25,
        totalEpisodes: 150,
        totalViews: 5000,
        popularGenres: ["Romance", "Comedy", "Suspense"]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content analytics" });
    }
  });

  app.get("/api/admin/analytics/revenue", isAdmin, async (req, res) => {
    try {
      // In a real app, this would query for revenue analytics
      // For now, return mock data
      res.json({
        totalCoinsSpent: 5000,
        premiumUnlocks: 120,
        coinPurchases: 200,
        mostProfitableSeries: [
          { id: 1, title: "Royal Dynasty", revenue: 800 },
          { id: 2, title: "Crime Files", revenue: 600 },
          { id: 3, title: "Luxury Lives", revenue: 400 }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
