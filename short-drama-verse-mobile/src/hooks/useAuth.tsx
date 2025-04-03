import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';
import * as storage from '@/services/storage';
import { apiRequest } from '@/lib/queryClient';
import { Alert } from 'react-native';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: string;
  isAdmin: boolean;
  coinBalance: number;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Custom hook for login mutation
function useLoginMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response: AuthResponse = await api.apiRequest('POST', api.endpoints.auth.login, credentials);
        
        // Save token and user data
        await storage.setToken(response.token);
        await storage.setUserData(response.user);
        
        return response.user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      // Handle login error
      console.error('Login mutation error:', error);
      Alert.alert('Login Failed', error.message || 'Failed to log in. Please try again.');
    },
  });
}

// Custom hook for registration mutation
function useRegisterMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      try {
        const response: AuthResponse = await api.apiRequest('POST', api.endpoints.auth.register, credentials);
        
        // Save token and user data
        await storage.setToken(response.token);
        await storage.setUserData(response.user);
        
        return response.user;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      // Handle registration error
      console.error('Registration mutation error:', error);
      Alert.alert('Registration Failed', error.message || 'Failed to register. Please try again.');
    },
  });
}

// Custom hook for logout mutation
function useLogoutMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        await api.apiRequest('POST', api.endpoints.auth.logout);
        
        // Clear local storage
        await storage.removeToken();
        await storage.removeUserData();
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Reset auth state and invalidate queries
      queryClient.setQueryData(['/api/user'], null);
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      // Handle logout error
      console.error('Logout mutation error:', error);
      Alert.alert('Logout Failed', error.message || 'Failed to log out. Please try again.');
    },
  });
}

// Custom hook for profile update mutation
function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      try {
        const response: User = await api.apiRequest('PATCH', api.endpoints.profile.update, data);
        
        // Update stored user data
        await storage.setUserData(response);
        
        return response;
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      // Handle profile update error
      console.error('Profile update mutation error:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
    },
  });
}

// Context type definition
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  updateProfileMutation: ReturnType<typeof useUpdateProfileMutation>;
}

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Query hook for user data
  const { 
    data: user,
    isLoading: isLoadingUser,
    error
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        return await apiRequest('GET', api.endpoints.auth.user);
      } catch (error) {
        if (error instanceof api.ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    // Don't fetch until we've checked for stored credentials
    enabled: !initialLoading
  });
  
  // Mutations
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  
  // On mount, check if we have stored credentials
  useEffect(() => {
    async function restoreUser() {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUserData();
        
        if (storedToken && storedUser) {
          // If we have stored credentials, set them in the query client cache
          queryClient.setQueryData(['/api/user'], storedUser);
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    restoreUser();
  }, [queryClient]);
  
  // Combined loading state
  const isLoading = initialLoading || isLoadingUser;
  
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
        updateProfileMutation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};