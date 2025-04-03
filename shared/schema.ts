import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { integer, pgTable, text, timestamp, boolean, json, serial } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
  isAdmin: boolean('is_admin').default(false),
  coinBalance: integer('coin_balance').default(0),
});

// Drama series table
export const dramaSeries = pgTable('drama_series', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  bannerUrl: text('banner_url'),
  genre: text('genre').array(),
  releaseDate: timestamp('release_date').notNull(),
  actors: text('actors').array(),
  director: text('director'),
  averageRating: integer('average_rating'),
  totalEpisodes: integer('total_episodes').notNull(),
});

// Episodes table
export const episodes = pgTable('episodes', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').references(() => dramaSeries.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  videoUrl: text('video_url').notNull(),
  duration: integer('duration').notNull(), // in seconds
  episodeNumber: integer('episode_number').notNull(),
  releaseDate: timestamp('release_date').notNull(),
  isPremium: boolean('is_premium').default(false),
  price: integer('price'), // coin cost if premium
});

// Watchlist table
export const watchlists = pgTable('watchlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  seriesId: integer('series_id').references(() => dramaSeries.id).notNull(),
  addedAt: timestamp('added_at').defaultNow(),
});

// Watch history table
export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  episodeId: integer('episode_id').references(() => episodes.id).notNull(),
  watchedAt: timestamp('watched_at').defaultNow(),
  watchDuration: integer('watch_duration'), // in seconds
  completed: boolean('completed').default(false),
  progress: integer('progress'), // percentage watched
});

// Ratings table
export const ratings = pgTable('ratings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  seriesId: integer('series_id').references(() => dramaSeries.id).notNull(),
  rating: integer('rating').notNull(), // 1-5 scale
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Transactions table for coin purchases
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  transactionType: text('transaction_type').notNull(), // 'purchase', 'refund', 'content_buy'
  createdAt: timestamp('created_at').defaultNow(),
  metadata: json('metadata'),
});

// Advertisements table
export const advertisements = pgTable('advertisements', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  targetUrl: text('target_url'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  placement: text('placement').notNull(), // 'home', 'player', 'search', etc.
  isActive: boolean('is_active').default(true),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDramaSeriesSchema = createInsertSchema(dramaSeries).omit({ id: true });
export const insertEpisodeSchema = createInsertSchema(episodes).omit({ id: true });
export const insertWatchlistSchema = createInsertSchema(watchlists).omit({ id: true });
export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({ id: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({ id: true });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DramaSeries = typeof dramaSeries.$inferSelect;
export type InsertDramaSeries = z.infer<typeof insertDramaSeriesSchema>;

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;

export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type WatchHistory = typeof watchHistory.$inferSelect;
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;