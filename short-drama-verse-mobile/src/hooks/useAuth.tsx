import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User } from '@/types/drama';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '@/services/api';
import { useSafeMutation, useSafeQuery, queryClient } from '@/lib/queryClient';

// Context type definition
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
  profileUpdateLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation();

  // Clear error state
  const clearError = () => setError(null);

  // Login mutation
  const { mutateAsync: loginMutate, isPending: loginLoading } = useSafeMutation<AuthResponse>({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return await api.request('POST', api.endpoints.auth.login, credentials);
    },
    onSuccess: async (data) => {
      await api.setAuthToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: [api.endpoints.auth.user] });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to login');
      setIsAuthenticated(false);
    },
  });

  // Register mutation
  const { mutateAsync: registerMutate, isPending: registerLoading } = useSafeMutation<AuthResponse>({
    mutationFn: async (userData: { username: string; email: string; password: string }) => {
      return await api.request('POST', api.endpoints.auth.register, userData);
    },
    onSuccess: async (data) => {
      await api.setAuthToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: [api.endpoints.auth.user] });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to register');
      setIsAuthenticated(false);
    },
  });

  // Logout mutation
  const { mutateAsync: logoutMutate } = useSafeMutation({
    mutationFn: async () => {
      return await api.request('POST', api.endpoints.auth.logout);
    },
    onSuccess: async () => {
      await api.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      // Reset navigation to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' as never }],
      });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to logout');
      // Even if the server call fails, we clear local auth
      api.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    },
  });

  // Profile update mutation
  const { mutateAsync: updateProfileMutate, isPending: profileUpdateLoading } = useSafeMutation<User>({
    mutationFn: async (profileData: Partial<User>) => {
      return await api.request('PATCH', api.endpoints.profile.update, profileData);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: [api.endpoints.auth.user] });
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update profile');
    },
  });

  // Check authentication status on app startup
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        const isAuthenticated = await api.isAuthenticated();
        if (isAuthenticated) {
          // Fetch user details
          const userData = await api.request<User>('GET', api.endpoints.auth.user);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        console.error('Authentication check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Expose the login function
  const login = async (username: string, password: string) => {
    clearError();
    await loginMutate({ username, password });
  };

  // Expose the register function
  const register = async (username: string, email: string, password: string) => {
    clearError();
    await registerMutate({ username, email, password });
  };

  // Expose the logout function
  const logout = async () => {
    clearError();
    await logoutMutate();
  };

  // Expose the update profile function
  const updateProfile = async (profileData: Partial<User>) => {
    clearError();
    await updateProfileMutate(profileData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginLoading,
        registerLoading,
        profileUpdateLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};