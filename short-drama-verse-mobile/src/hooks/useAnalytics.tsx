/**
 * Analytics Hook
 * 
 * Provides analytics state and methods throughout the app.
 * Manages tracking user actions and content engagement.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analytics } from '@/services/analytics';
import { SeriesAnalytics, UserAnalytics, RevenueAnalytics } from '@/types/drama';
import { useAuth } from './useAuth';

// Analytics context interface
interface AnalyticsContextType {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  trackScreenView: (screenName: string, properties?: Record<string, any>) => void;
  trackVideoStart: (episodeId: number, seriesId: number, properties?: Record<string, any>) => void;
  trackVideoProgress: (
    episodeId: number,
    seriesId: number,
    progress: number,
    position: number,
    properties?: Record<string, any>
  ) => void;
  trackVideoComplete: (episodeId: number, seriesId: number, properties?: Record<string, any>) => void;
  trackAddToWatchlist: (seriesId: number, properties?: Record<string, any>) => void;
  trackRemoveFromWatchlist: (seriesId: number, properties?: Record<string, any>) => void;
  trackRateContent: (seriesId: number, rating: number, properties?: Record<string, any>) => void;
  trackShareContent: (seriesId: number, shareMethod: string, properties?: Record<string, any>) => void;
  trackSearch: (query: string, resultCount: number, properties?: Record<string, any>) => void;
  trackError: (errorCode: string, errorMessage: string, properties?: Record<string, any>) => void;
  trackDownloadStart: (episodeId: number, seriesId: number, properties?: Record<string, any>) => void;
  trackDownloadComplete: (
    episodeId: number,
    seriesId: number,
    fileSize: number,
    properties?: Record<string, any>
  ) => void;
  trackUserPreference: (
    preferenceType: string,
    value: string,
    properties?: Record<string, any>
  ) => void;
  
  // Analytics data hooks
  getSeriesAnalytics: (
    seriesId: number,
    timeRange?: 'day' | 'week' | 'month' | 'year'
  ) => Promise<SeriesAnalytics>;
  getUserAnalytics: (
    timeRange?: 'day' | 'week' | 'month' | 'year'
  ) => Promise<UserAnalytics>;
  getRevenueAnalytics: (
    timeRange?: 'day' | 'week' | 'month' | 'year'
  ) => Promise<RevenueAnalytics>;
}

// Create the analytics context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

/**
 * Analytics Provider Component
 * 
 * Provides analytics state and methods to children components.
 * 
 * @param children - Child components
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const { user } = useAuth();
  
  // Set the user ID for analytics when it changes
  useEffect(() => {
    if (user) {
      analytics.setUserId(user.id);
    } else {
      analytics.setUserId(null);
    }
  }, [user]);
  
  // Update analytics enabled state
  useEffect(() => {
    analytics.setEnabled(isEnabled);
  }, [isEnabled]);
  
  // Flush events when the app is closed or backgrounded
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        analytics.forceFlush();
      }
    };
    
    // This would normally use AppState.addEventListener from react-native
    // But we'll just simulate it for the structure
    
    return () => {
      // Clean up listener
      // This would normally use AppState.removeEventListener
      
      // Flush any remaining events on unmount
      analytics.forceFlush();
    };
  }, []);
  
  // Analytics tracking methods
  const trackScreenView = (screenName: string, properties: Record<string, any> = {}) => {
    analytics.trackScreenView(screenName, properties);
  };
  
  const trackVideoStart = (episodeId: number, seriesId: number, properties: Record<string, any> = {}) => {
    analytics.trackVideoStart(episodeId, seriesId, properties);
  };
  
  const trackVideoProgress = (
    episodeId: number,
    seriesId: number,
    progress: number,
    position: number,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackVideoProgress(episodeId, seriesId, progress, position, properties);
  };
  
  const trackVideoComplete = (episodeId: number, seriesId: number, properties: Record<string, any> = {}) => {
    analytics.trackVideoComplete(episodeId, seriesId, properties);
  };
  
  const trackAddToWatchlist = (seriesId: number, properties: Record<string, any> = {}) => {
    analytics.trackAddToWatchlist(seriesId, properties);
  };
  
  const trackRemoveFromWatchlist = (seriesId: number, properties: Record<string, any> = {}) => {
    analytics.trackRemoveFromWatchlist(seriesId, properties);
  };
  
  const trackRateContent = (seriesId: number, rating: number, properties: Record<string, any> = {}) => {
    analytics.trackRateContent(seriesId, rating, properties);
  };
  
  const trackShareContent = (seriesId: number, shareMethod: string, properties: Record<string, any> = {}) => {
    analytics.trackShareContent(seriesId, shareMethod, properties);
  };
  
  const trackSearch = (query: string, resultCount: number, properties: Record<string, any> = {}) => {
    analytics.trackSearch(query, resultCount, properties);
  };
  
  const trackError = (errorCode: string, errorMessage: string, properties: Record<string, any> = {}) => {
    analytics.trackError(errorCode, errorMessage, properties);
  };
  
  const trackDownloadStart = (episodeId: number, seriesId: number, properties: Record<string, any> = {}) => {
    analytics.trackDownloadStart(episodeId, seriesId, properties);
  };
  
  const trackDownloadComplete = (
    episodeId: number,
    seriesId: number,
    fileSize: number,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackDownloadComplete(episodeId, seriesId, fileSize, properties);
  };
  
  const trackUserPreference = (
    preferenceType: string,
    value: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackUserPreference(preferenceType, value, properties);
  };
  
  // Analytics data hooks
  const getSeriesAnalytics = async (
    seriesId: number,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<SeriesAnalytics> => {
    return analytics.getSeriesAnalytics(seriesId, timeRange);
  };
  
  const getUserAnalytics = async (
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<UserAnalytics> => {
    return analytics.getUserAnalytics(timeRange);
  };
  
  const getRevenueAnalytics = async (
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<RevenueAnalytics> => {
    return analytics.getRevenueAnalytics(timeRange);
  };
  
  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
  };
  
  // Create the context value
  const contextValue: AnalyticsContextType = {
    isEnabled,
    setEnabled,
    trackScreenView,
    trackVideoStart,
    trackVideoProgress,
    trackVideoComplete,
    trackAddToWatchlist,
    trackRemoveFromWatchlist,
    trackRateContent,
    trackShareContent,
    trackSearch,
    trackError,
    trackDownloadStart,
    trackDownloadComplete,
    trackUserPreference,
    getSeriesAnalytics,
    getUserAnalytics,
    getRevenueAnalytics,
  };
  
  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Analytics Hook
 * 
 * Custom hook to use the analytics context.
 * 
 * @returns Analytics context value
 * @throws Error if used outside of AnalyticsProvider
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
}