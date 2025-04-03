import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthCredentials, RegisterCredentials, ProfileUpdateFormData } from '@/types/drama';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { endpoints } from '@/services/api';

// Keys for local storage
const USER_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

// AuthContext type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  login: (credentials: AuthCredentials) => Promise<User>;
  register: (userData: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateFormData) => Promise<User>;
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component for AuthContext
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error restoring auth state:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Login method
  const login = async (credentials: AuthCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<User>(
        'POST',
        endpoints.auth.login,
        credentials
      );

      // Store user data
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response));
      setUser(response);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries({ queryKey: [endpoints.user.current] });
      
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Login Failed', error.message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register method
  const register = async (userData: RegisterCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<User>(
        'POST',
        endpoints.auth.register,
        userData
      );

      // Store user data
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response));
      setUser(response);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries({ queryKey: [endpoints.user.current] });
      
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Registration Failed', error.message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('POST', endpoints.auth.logout);
      
      // Clear stored user data
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      
      // Reset user state
      setUser(null);
      
      // Clear all queries in the cache
      queryClient.clear();
      
      // Navigate to auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Logout error:', error);
      
      // Even if the API call fails, we still want to clear local state
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: ProfileUpdateFormData): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<User>(
        'PATCH',
        endpoints.user.updateProfile,
        data
      );

      // Update stored user data
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response));
      setUser(response);
      
      // Invalidate user data queries
      queryClient.invalidateQueries({ queryKey: [endpoints.user.current] });
      
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Profile Update Failed', error.message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;