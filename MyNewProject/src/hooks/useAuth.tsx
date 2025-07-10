/**
 * Authentication Hook
 * 
 * Provides authentication state and methods for the application
 */
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';
import { API_CONFIG } from '@/constants/config';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  resetError: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Initial auth state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

/**
 * AuthProvider component
 * 
 * @param children Components that will have access to the auth context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get user and token from storage
        const user = await storageService.getUser<User>();
        const token = await storageService.getAuthToken();

        if (user && token) {
          setState({
            ...state,
            user,
            token,
            isInitialized: true,
          });
        } else {
          setState({
            ...state,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          ...state,
          error: 'Error initializing authentication',
          isInitialized: true,
        });
      }
    };

    initAuth();
  }, []);

  /**
   * Login with username and password
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState({ ...state, isLoading: true, error: null });

    try {
      // Call login API
      const response = await apiService.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);

      const { user, accessToken, refreshToken } = response;

      // Store tokens and user data
      await storageService.setAuthToken(accessToken);
      await storageService.setRefreshToken(refreshToken);
      await storageService.setUser(user);

      // Update state
      setState({
        ...state,
        user,
        token: accessToken,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      setState({
        ...state,
        error: error.message || 'Login failed',
        isLoading: false,
      });
    }
  };

  /**
   * Register a new user
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setState({ ...state, isLoading: true, error: null });

    try {
      // Call register API
      const response = await apiService.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, credentials);

      const { user, accessToken, refreshToken } = response;

      // Store tokens and user data
      await storageService.setAuthToken(accessToken);
      await storageService.setRefreshToken(refreshToken);
      await storageService.setUser(user);

      // Update state
      setState({
        ...state,
        user,
        token: accessToken,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      setState({
        ...state,
        error: error.message || 'Registration failed',
        isLoading: false,
      });
    }
  };

  /**
   * Logout the current user
   */
  const logout = async (): Promise<void> => {
    setState({ ...state, isLoading: true, error: null });

    try {
      // Call logout API if token exists
      if (state.token) {
        await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      }

      // Clear storage
      await storageService.clearAuthData();

      // Update state
      setState({
        ...state,
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Force logout even if API call fails
      await storageService.clearAuthData();
      
      setState({
        ...state,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    setState({ ...state, isLoading: true, error: null });

    try {
      // Call update profile API
      const updatedUser = await apiService.patch<User>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
        profileData
      );

      // Update user in storage
      await storageService.setUser(updatedUser);

      // Update state
      setState({
        ...state,
        user: updatedUser,
        isLoading: false,
      });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      setState({
        ...state,
        error: error.message || 'Profile update failed',
        isLoading: false,
      });
    }
  };

  /**
   * Reset error state
   */
  const resetError = (): void => {
    setState({ ...state, error: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        isInitialized: state.isInitialized,
        error: state.error,
        login,
        register,
        logout,
        updateUserProfile,
        resetError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook
 * 
 * @returns Auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};