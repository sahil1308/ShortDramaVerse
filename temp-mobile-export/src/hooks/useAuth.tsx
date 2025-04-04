/**
 * Authentication Hook for ShortDramaVerse Mobile
 * 
 * This hook manages user authentication state and provides
 * methods for login, registration, logout, and profile management.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import api from '@/services/api';
import analytics from '@/services/analytics';
import storage from '@/services/storage';
import { AnalyticsEventType } from '@/services/analytics';
import { User } from '@/types/drama';

/**
 * Authentication Context Type
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Register Data Interface
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

/**
 * Authentication Provider Props Interface
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides authentication
 * functions to child components.
 * 
 * @param props - AuthProviderProps
 * @returns Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check for existing authentication session on app load
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if authentication token exists
        if (api.isAuthenticated()) {
          // Fetch user profile
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
          
          // Set user ID in analytics
          analytics.setUserId(userData.id);
          
          // Store user data
          await storage.storeUserProfile(userData);
        } else {
          // Try to load from local storage as fallback
          const storedUser = await storage.getUserProfile<User>();
          if (storedUser) {
            setUser(storedUser);
            analytics.setUserId(storedUser.id);
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  /**
   * Login user
   * 
   * @param username - Username
   * @param password - Password
   */
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Authenticate user
      const response = await api.post<{ user: User; token: string; refreshToken: string }>(
        '/auth/login',
        { username, password }
      );
      
      // Set authentication token
      await api.setAuthToken(response.token, response.refreshToken);
      
      // Set user data
      setUser(response.user);
      
      // Store user data
      await storage.storeUserProfile(response.user);
      
      // Set user ID in analytics and track login event
      analytics.setUserId(response.user.id);
      analytics.trackEvent(AnalyticsEventType.LOGIN, {
        userId: response.user.id,
        username: response.user.username,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * 
   * @param userData - User registration data
   */
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Register user
      const response = await api.post<{ user: User; token: string; refreshToken: string }>(
        '/auth/register',
        userData
      );
      
      // Set authentication token
      await api.setAuthToken(response.token, response.refreshToken);
      
      // Set user data
      setUser(response.user);
      
      // Store user data
      await storage.storeUserProfile(response.user);
      
      // Set user ID in analytics and track registration event
      analytics.setUserId(response.user.id);
      analytics.trackEvent(AnalyticsEventType.REGISTRATION, {
        userId: response.user.id,
        username: response.user.username,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Track logout event
      if (user) {
        analytics.trackEvent(AnalyticsEventType.LOGOUT, {
          userId: user.id,
          username: user.username,
        });
      }
      
      // Call logout API
      await api.post('/auth/logout');
      
      // Clear authentication token
      await api.clearAuthToken();
      
      // Clear user ID in analytics
      analytics.setUserId(null);
      
      // Remove user data
      await storage.removeData(storage.StorageKey.USER_PROFILE);
      
      // Clear user state
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
      
      // Force logout anyway
      await api.clearAuthToken();
      await storage.removeData(storage.StorageKey.USER_PROFILE);
      analytics.setUserId(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user profile
   * 
   * @param profileData - Profile data to update
   */
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update profile
      const updatedUser = await api.put<User>('/auth/profile', profileData);
      
      // Update user state
      setUser(updatedUser);
      
      // Update stored user data
      await storage.storeUserProfile(updatedUser);
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password
   * 
   * @param email - User email
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset password
      await api.post('/auth/reset-password', { email });
      
      // Show success message
      Alert.alert(
        'Password Reset',
        'If an account exists with this email, you will receive password reset instructions.'
      );
    } catch (err) {
      // Show same message even if error to prevent user enumeration
      Alert.alert(
        'Password Reset',
        'If an account exists with this email, you will receive password reset instructions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  // Create context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Use Auth Hook
 * 
 * Provides access to authentication context.
 * 
 * @returns Authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};