/**
 * Navigation type definitions for ShortDramaVerse Mobile
 * 
 * This file contains types for navigation stacks, routes,
 * and screen parameters.
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Main navigation stacks
export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  SeriesStack: NavigatorScreenParams<SeriesStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
  Loading: undefined;
  Onboarding: undefined;
};

// Authentication stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  ResetPassword: { token: string };
};

// Main tabs
export type MainTabsParamList = {
  Home: undefined;
  Explore: undefined;
  Watchlist: undefined;
  Downloads: undefined;
  Profile: undefined;
};

// Series stack
export type SeriesStackParamList = {
  SeriesList: undefined;
  SeriesDetail: { 
    seriesId: number;
    title?: string;
  };
  EpisodePlayer: {
    episodeId: number;
    seriesId: number;
    position?: number;
  };
  SeriesComments: { seriesId: number };
  EpisodeComments: { episodeId: number };
  RateSeries: { seriesId: number };
};

// Profile stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  WatchHistory: undefined;
  Settings: undefined;
  Subscriptions: undefined;
  Transactions: undefined;
  DownloadedContent: undefined;
  HelpCenter: undefined;
  Notifications: undefined;
};

// Admin stack
export type AdminStackParamList = {
  AdminDashboard: undefined;
  ContentManagement: undefined;
  UserManagement: {
    userId?: number;
  };
  Analytics: {
    seriesId?: number;
    type?: 'content' | 'user' | 'overview';
  };
  Reports: undefined;
  Settings: undefined;
};

// Combined navigation types for screens that need access to multiple stacks
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type SeriesDetailNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SeriesStackParamList, 'SeriesDetail'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type EpisodePlayerNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SeriesStackParamList, 'EpisodePlayer'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type WatchlistNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Watchlist'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ExploreNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Explore'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type DownloadsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Downloads'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type AdminDashboardNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Screen props
export type RootStackProps = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackProps = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabsProps = BottomTabNavigationProp<MainTabsParamList>;
export type SeriesStackProps = NativeStackNavigationProp<SeriesStackParamList>;
export type ProfileStackProps = NativeStackNavigationProp<ProfileStackParamList>;
export type AdminStackProps = NativeStackNavigationProp<AdminStackParamList>;