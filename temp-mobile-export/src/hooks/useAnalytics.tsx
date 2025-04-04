/**
 * Analytics Hook for ShortDramaVerse Mobile
 * 
 * This hook provides a React interface to the analytics service
 * and handles app state changes for proper tracking.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import analytics, { AnalyticsEventType } from '@/services/analytics';
import { AnalyticsData } from '@/types/drama';
import api from '@/services/api';

/**
 * Analytics Context Type
 */
interface AnalyticsContextType {
  // Track screen views
  trackScreenView: (screenName: string, screenClass?: string) => void;
  
  // Track video events
  trackVideoPlay: (episodeId: number, seriesId: number, position: number, duration: number) => void;
  trackVideoPause: (episodeId: number, seriesId: number, position: number, duration: number) => void;
  trackVideoComplete: (episodeId: number, seriesId: number, duration: number) => void;
  trackVideoProgress: (episodeId: number, seriesId: number, position: number, duration: number) => void;
  
  // Get analytics data
  getUserAnalytics: () => Promise<AnalyticsData | null>;
  getAdminAnalytics: () => Promise<AnalyticsData | null>;
  getSeriesAnalytics: (seriesId: number) => Promise<AnalyticsData | null>;
  
  // Track other events
  trackSearch: (query: string, resultsCount: number, filters?: Record<string, any>) => void;
  trackContentRating: (seriesId: number, score: number, hasComment: boolean) => void;
  trackError: (errorName: string, errorMessage: string, stack?: string) => void;
}

// Create analytics context
const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

/**
 * Analytics Provider Component
 */
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize analytics on first render
  useEffect(() => {
    // Initialize analytics
    const initAnalytics = async () => {
      // Add app state change listener
      AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        // Clean up analytics when component unmounts
        analytics.cleanup();
      };
    };
    
    initAnalytics();
  }, []);
  
  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground
      analytics.trackEvent(AnalyticsEventType.APP_OPEN);
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background
      analytics.trackEvent(AnalyticsEventType.APP_CLOSE);
      analytics.flushEvents();
    }
  };
  
  // Track screen view
  const trackScreenView = (screenName: string, screenClass?: string) => {
    analytics.trackScreenView(screenName, screenClass);
  };
  
  // Track video play
  const trackVideoPlay = (
    episodeId: number,
    seriesId: number,
    position: number,
    duration: number
  ) => {
    analytics.trackVideoEvent(
      AnalyticsEventType.VIDEO_PLAY,
      {
        episodeId,
        seriesId,
        position,
        duration,
      }
    );
  };
  
  // Track video pause
  const trackVideoPause = (
    episodeId: number,
    seriesId: number,
    position: number,
    duration: number
  ) => {
    analytics.trackVideoEvent(
      AnalyticsEventType.VIDEO_PAUSE,
      {
        episodeId,
        seriesId,
        position,
        duration,
      }
    );
  };
  
  // Track video complete
  const trackVideoComplete = (
    episodeId: number,
    seriesId: number,
    duration: number
  ) => {
    analytics.trackVideoEvent(
      AnalyticsEventType.VIDEO_COMPLETE,
      {
        episodeId,
        seriesId,
        position: duration,
        duration,
      }
    );
  };
  
  // Track video progress
  const trackVideoProgress = (
    episodeId: number,
    seriesId: number,
    position: number,
    duration: number
  ) => {
    analytics.trackVideoEvent(
      AnalyticsEventType.VIDEO_PROGRESS,
      {
        episodeId,
        seriesId,
        position,
        duration,
      }
    );
  };
  
  // Track search
  const trackSearch = (
    query: string,
    resultsCount: number,
    filters?: Record<string, any>
  ) => {
    analytics.trackSearch(query, resultsCount, filters);
  };
  
  // Track content rating
  const trackContentRating = (
    seriesId: number,
    score: number,
    hasComment: boolean
  ) => {
    analytics.trackContentRating(seriesId, score, hasComment);
  };
  
  // Track error
  const trackError = (
    errorName: string,
    errorMessage: string,
    stack?: string
  ) => {
    analytics.trackError(errorName, errorMessage, stack);
  };
  
  // Get user analytics data
  const getUserAnalytics = async (): Promise<AnalyticsData | null> => {
    try {
      return await api.get<AnalyticsData>('/analytics/user');
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  };
  
  // Get admin analytics data
  const getAdminAnalytics = async (): Promise<AnalyticsData | null> => {
    try {
      return await api.get<AnalyticsData>('/analytics/admin');
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      return null;
    }
  };
  
  // Get series analytics data
  const getSeriesAnalytics = async (seriesId: number): Promise<AnalyticsData | null> => {
    try {
      return await api.get<AnalyticsData>(`/analytics/series/${seriesId}`);
    } catch (error) {
      console.error(`Error fetching series analytics for series ${seriesId}:`, error);
      return null;
    }
  };
  
  return (
    <AnalyticsContext.Provider
      value={{
        trackScreenView,
        trackVideoPlay,
        trackVideoPause,
        trackVideoComplete,
        trackVideoProgress,
        trackSearch,
        trackContentRating,
        trackError,
        getUserAnalytics,
        getAdminAnalytics,
        getSeriesAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Use Analytics Hook
 * 
 * Provides access to analytics context.
 * 
 * @returns Analytics context
 * @throws Error if used outside AnalyticsProvider
 */
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
};