import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

import { User, AuthCredentials, RegisterCredentials } from '@/types/drama';
import api from '@/services/api';
import { endpoints } from '@/services/api';

// Create context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        
        if (token) {
          // Verify token with the server
          const userData = await fetchCurrentUser();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Fetch current user from API
  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await api.get(endpoints.auth.user);
      return response.data;
    } catch (error) {
      // Clear stored token if unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await AsyncStorage.removeItem('auth_token');
      }
      return null;
    }
  };

  // Login user
  const login = async (credentials: AuthCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(endpoints.auth.login, credentials);
      const userData = response.data;
      
      // Store user data and token
      setUser(userData);
      await AsyncStorage.setItem('auth_token', userData.token);
      
      // Invalidate queries that might depend on auth status
      queryClient.invalidateQueries({ queryKey: [endpoints.auth.user] });
      
      return userData;
    } catch (error) {
      // Handle login error
      const errorMessage = 
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Login failed. Please check your credentials and try again.';
      
      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (credentials: RegisterCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(endpoints.auth.register, credentials);
      const userData = response.data;
      
      // Store user data and token
      setUser(userData);
      await AsyncStorage.setItem('auth_token', userData.token);
      
      // Invalidate queries that might depend on auth status
      queryClient.invalidateQueries({ queryKey: [endpoints.auth.user] });
      
      return userData;
    } catch (error) {
      // Handle registration error
      const errorMessage = 
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Registration failed. Please try again with different credentials.';
      
      setError(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear user data and token regardless of API response
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
      
      // Clear any user-related queries from the cache
      queryClient.clear();
      
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put(endpoints.user.updateProfile, userData);
      const updatedUser = response.data;
      
      // Update local user state
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
      
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: [endpoints.auth.user] });
      
      return updatedUser;
    } catch (error) {
      // Handle update error
      const errorMessage = 
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to update profile. Please try again.';
      
      setError(errorMessage);
      Alert.alert('Update Failed', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Create value object with all auth functions and state
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};