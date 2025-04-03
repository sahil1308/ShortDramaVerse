import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  User, 
  AuthCredentials, 
  RegisterCredentials, 
  RootStackParamList 
} from '@/types/drama';
import { apiRequest } from '@/lib/queryClient';
import { endpoints } from '@/services/api';

// Keys for AsyncStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Auth context type definition
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  clearError: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Save user to AsyncStorage
  const saveUserToStorage = async (user: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  };

  // Save token to AsyncStorage
  const saveTokenToStorage = async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  };

  // Clear auth data from AsyncStorage
  const clearAuthData = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // Login function
  const login = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<{user: User; token: string}>('POST', endpoints.auth.login, credentials);
      
      await saveTokenToStorage(response.token);
      await saveUserToStorage(response.user);
      
      // Navigate to main screen after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      setError(error.message || 'Failed to login. Please try again.');
      Alert.alert('Login Failed', error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<{user: User; token: string}>('POST', endpoints.auth.register, credentials);
      
      await saveTokenToStorage(response.token);
      await saveUserToStorage(response.user);
      
      // Navigate to main screen after successful registration
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      setError(error.message || 'Failed to register. Please try again.');
      Alert.alert('Registration Failed', error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest('POST', endpoints.auth.logout);
      
      // Clear local state and storage
      await clearAuthData();
      
      // Clear all queries from cache
      queryClient.clear();
      
      // Navigate to auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if API logout fails, we clear local data
      await clearAuthData();
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await apiRequest<User>('PATCH', endpoints.user.updateProfile, data);
      await saveUserToStorage(updatedUser);
      
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile. Please try again.');
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error state
  const clearError = () => setError(null);

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

export default AuthProvider;