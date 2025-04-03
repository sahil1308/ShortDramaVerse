import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { User } from '@/types/drama';
import { apiRequest } from '@/lib/queryClient';
import { endpoints } from '@/services/api';
import { setToken, removeToken, setUserData, removeUserData, getUserData } from '@/services/storage';
import { Alert } from 'react-native';

// Auth Types
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Auth Context Type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginCredentials>;
  registerMutation: UseMutationResult<AuthResponse, Error, RegisterCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  updateProfileMutation: UseMutationResult<User, Error, UpdateProfileData>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Check if the user is already logged in
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const userData = await apiRequest<User>('GET', endpoints.auth.user);
        return userData;
      } catch (error) {
        // Clear any stored tokens on authentication error
        await removeToken();
        await removeUserData();
        return null;
      }
    },
    enabled: !initialLoading, // Disable initial fetch until we check AsyncStorage
  });
  
  // Check for stored user data on app start
  useEffect(() => {
    async function checkStoredUser() {
      try {
        const userData = await getUserData();
        if (userData) {
          queryClient.setQueryData(['user'], userData);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    checkStoredUser();
  }, [queryClient]);
  
  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest<AuthResponse>('POST', endpoints.auth.login, credentials, {
        authRequired: false,
      });
      
      // Store token and user data
      await setToken(response.token);
      await setUserData(response.user);
      
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
      Alert.alert('Login Failed', (error as Error).message || 'Could not login. Please try again.');
    },
  });
  
  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest<AuthResponse>('POST', endpoints.auth.register, credentials, {
        authRequired: false,
      });
      
      // Store token and user data
      await setToken(response.token);
      await setUserData(response.user);
      
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', (error as Error).message || 'Could not create account. Please try again.');
    },
  });
  
  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest<void>('POST', endpoints.auth.logout);
      await removeToken();
      await removeUserData();
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', (error as Error).message || 'Could not logout. Please try again.');
    },
  });
  
  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      return apiRequest<User>('PUT', endpoints.auth.user, profileData);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      setUserData(updatedUser);
      Alert.alert('Success', 'Your profile has been updated successfully.');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      Alert.alert('Update Failed', (error as Error).message || 'Could not update profile. Please try again.');
    },
  });
  
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: initialLoading || isUserLoading,
        error: userError as Error,
        loginMutation,
        registerMutation,
        logoutMutation,
        updateProfileMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}