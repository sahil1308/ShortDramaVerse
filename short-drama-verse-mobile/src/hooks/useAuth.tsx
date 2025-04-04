/**
 * Authentication Hook
 * 
 * Provides authentication state and methods throughout the app.
 * Manages user login, registration, logout, and profile updates.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types/drama';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import { analytics } from '@/services/analytics';

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  purchaseCoins: (packageId: number, amount: number) => Promise<void>;
}

// Login credentials interface
interface LoginCredentials {
  username: string;
  password: string;
}

// Registration data interface
interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * 
 * Provides authentication state and methods to children components.
 * 
 * @param children - Child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  
  // Get user data from storage when the app loads
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await storage.getUserData();
        if (userData) {
          // Set user ID for analytics
          analytics.setUserId(userData.id);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load user data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user data'));
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // User data query
  const { data: user, refetch } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        // Check if we have a token
        const token = await storage.getAuthToken();
        if (!token) return null;
        
        // Get user profile from API
        const userData = await api.get<User>('/user/profile');
        await storage.setUserData(userData);
        return userData;
      } catch (err) {
        console.error('Error fetching user profile:', err);
        return null;
      }
    },
    initialData: null,
    enabled: !isLoading, // Only run after initial loading
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<{ user: User; token: string; refreshToken: string }>('/auth/login', credentials);
      const { user, token, refreshToken } = response;
      
      // Store auth data
      await storage.setAuthToken(token);
      await storage.setRefreshToken(refreshToken);
      await storage.setUserData(user);
      
      // Track login for analytics
      analytics.setUserId(user.id);
      analytics.trackLogin('email');
      
      return user;
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Login failed'));
      console.error('Login error:', err);
    },
    onSuccess: () => {
      setError(null);
      refetch();
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await api.post<{ user: User; token: string; refreshToken: string }>('/auth/register', userData);
      const { user, token, refreshToken } = response;
      
      // Store auth data
      await storage.setAuthToken(token);
      await storage.setRefreshToken(refreshToken);
      await storage.setUserData(user);
      
      // Track registration for analytics
      analytics.setUserId(user.id);
      analytics.trackRegistration('email');
      
      return user;
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Registration failed'));
      console.error('Registration error:', err);
    },
    onSuccess: () => {
      setError(null);
      refetch();
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Track logout for analytics before user data is cleared
      if (user) {
        analytics.trackLogout();
      }
      
      // Call logout API endpoint
      await api.post('/auth/logout');
      
      // Clear auth data from storage
      await storage.clearAuthData();
      
      // Reset user ID for analytics
      analytics.setUserId(null);
    },
    onError: (err) => {
      console.error('Logout error:', err);
    },
    onSuccess: () => {
      // Clear user from query cache
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const updatedUser = await api.patch<User>('/user/profile', data);
      await storage.setUserData(updatedUser);
      return updatedUser;
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      console.error('Update profile error:', err);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      setError(null);
    },
  });
  
  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      await api.post('/auth/forgot-password', { email });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to request password reset'));
      console.error('Forgot password error:', err);
    },
    onSuccess: () => {
      setError(null);
    },
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      await api.post('/auth/reset-password', { token, password });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      console.error('Reset password error:', err);
    },
    onSuccess: () => {
      setError(null);
    },
  });
  
  // Purchase coins mutation
  const purchaseCoinsMutation = useMutation({
    mutationFn: async ({ packageId, amount }: { packageId: number; amount: number }) => {
      await api.post('/user/purchase-coins', { packageId, amount });
      
      // Track purchase for analytics
      analytics.trackPurchase(packageId, 'coin_package', amount);
      
      // Refresh user data to get updated coin balance
      await refreshUser();
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to purchase coins'));
      console.error('Purchase coins error:', err);
    },
    onSuccess: () => {
      setError(null);
    },
  });
  
  // Auth methods
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };
  
  const register = async (userData: RegisterData) => {
    return registerMutation.mutateAsync(userData);
  };
  
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const updateProfile = async (data: Partial<User>) => {
    return updateProfileMutation.mutateAsync(data);
  };
  
  const refreshUser = async () => {
    await refetch();
  };
  
  const forgotPassword = async (email: string) => {
    await forgotPasswordMutation.mutateAsync(email);
  };
  
  const resetPassword = async (token: string, password: string) => {
    await resetPasswordMutation.mutateAsync({ token, password });
  };
  
  const purchaseCoins = async (packageId: number, amount: number) => {
    await purchaseCoinsMutation.mutateAsync({ packageId, amount });
  };
  
  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
    forgotPassword,
    resetPassword,
    purchaseCoins,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth Hook
 * 
 * Custom hook to use the auth context.
 * 
 * @returns Auth context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}