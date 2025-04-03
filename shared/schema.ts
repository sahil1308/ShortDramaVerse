import { pgTable, text, serial, integer, boolean, timestamp, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  coins: integer("coins").default(0).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  profileImage: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Drama Series Schema
export const dramaSeries = pgTable("drama_series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  bannerUrl: text("banner_url"),
  genre: text("genre").array().notNull(),
  rating: integer("rating").default(0),
  isFeatured: boolean("is_featured").default(false),
  isPremium: boolean("is_premium").default(false),
  coinPrice: integer("coin_price").default(0),
  releaseDate: date("release_date").notNull(),
  channelId: integer("channel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDramaSeriesSchema = createInsertSchema(dramaSeries).pick({
  title: true,
  description: true,
  thumbnailUrl: true,
  bannerUrl: true,
  genre: true,
  rating: true,
  isFeatured: true,
  isPremium: true,
  coinPrice: true,
  releaseDate: true,
  channelId: true,
});

export type InsertDramaSeries = z.infer<typeof insertDramaSeriesSchema>;
export type DramaSeries = typeof dramaSeries.$inferSelect;

// Episodes Schema
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in seconds
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  seasonNumber: integer("season_number").default(1),
  episodeNumber: integer("episode_number").notNull(),
  releaseDate: date("release_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEpisodeSchema = createInsertSchema(episodes).pick({
  seriesId: true,
  title: true,
  description: true,
  duration: true,
  videoUrl: true,
  thumbnailUrl: true,
  seasonNumber: true,
  episodeNumber: true,
  releaseDate: true,
});

export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodes.$inferSelect;

// Channels Schema
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  logoUrl: text("logo_url").notNull(),
  followerCount: integer("follower_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  name: true,
  description: true,
  logoUrl: true,
  followerCount: true,
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

// Watchlist Schema
export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  seriesId: integer("series_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertWatchlistSchema = createInsertSchema(watchlists).pick({
  userId: true,
  seriesId: true,
});

export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlists.$inferSelect;

// Watch History Schema
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  episodeId: integer("episode_id").notNull(),
  progress: integer("progress").default(0), // in seconds
  isCompleted: boolean("is_completed").default(false),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).pick({
  userId: true,
  episodeId: true,
  progress: true,
  isCompleted: true,
});

export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistory.$inferSelect;

// User Channel Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  channelId: integer("channel_id").notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  channelId: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Coin Transactions
export const coinTransactions = pgTable("coin_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  transactionType: text("transaction_type").notNull(), // purchase, content_unlock, refund
  status: text("status").notNull(), // completed, pending, failed
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
});

export const insertCoinTransactionSchema = createInsertSchema(coinTransactions).pick({
  userId: true,
  amount: true,
  description: true,
  transactionType: true,
  status: true,
});

export type InsertCoinTransaction = z.infer<typeof insertCoinTransactionSchema>;
export type CoinTransaction = typeof coinTransactions.$inferSelect;
