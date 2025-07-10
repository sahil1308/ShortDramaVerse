/**
 * Navigation Types
 * 
 * Type definitions for React Navigation in the app.
 * Defines the parameter lists for all navigators and screens.
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { DramaSeries, Episode } from './drama';

/**
 * Root Stack Navigation Parameters
 * 
 * Defines parameters for the top-level stack navigator.
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  SeriesDetail: {
    seriesId: number;
    series?: DramaSeries;
  };
  Player: {
    episodeId: number;
    seriesId: number;
    episode?: Episode;
  };
};

/**
 * Main Tab Navigation Parameters
 * 
 * Defines parameters for the main tab navigator.
 */
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
  Admin: undefined;
};

/**
 * Auth Stack Navigation Parameters
 * 
 * Defines parameters for the authentication stack navigator.
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * Admin Stack Navigation Parameters
 * 
 * Defines parameters for the admin section stack navigator.
 */
export type AdminStackParamList = {
  Dashboard: undefined;
  ContentManagement: undefined;
  UserManagement: undefined;
  Analytics: undefined;
  Settings: undefined;
};