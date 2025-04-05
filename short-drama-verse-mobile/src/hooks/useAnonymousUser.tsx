/**
 * useAnonymousUser Hook
 * 
 * React hook for accessing and managing the anonymous user identity
 * throughout the application.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { anonymousAuthService, AnonymousUserInfo } from '@/services/anonymousAuth';

// Context type definition
interface AnonymousUserContextType {
  anonymousUser: AnonymousUserInfo | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  convertToRegistered: (userId: number) => Promise<boolean>;
}

// Create context with default values
const AnonymousUserContext = createContext<AnonymousUserContextType>({
  anonymousUser: null,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
  convertToRegistered: async () => false
});

// Provider component
export const AnonymousUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load or create anonymous user on mount
  useEffect(() => {
    loadAnonymousUser();
  }, []);

  // Function to load or create anonymous user
  const loadAnonymousUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await anonymousAuthService.getCurrentUser();
      setAnonymousUser(user);
    } catch (err) {
      console.error('Error loading anonymous user:', err);
      setError(err instanceof Error ? err : new Error('Failed to load anonymous user'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh user data
  const refreshUser = async (): Promise<void> => {
    await loadAnonymousUser();
  };

  // Function to convert anonymous user to registered
  const convertToRegistered = async (userId: number): Promise<boolean> => {
    try {
      const success = await anonymousAuthService.convertToRegisteredUser(userId);
      if (success) {
        // Clear anonymous user data from context
        setAnonymousUser(null);
      }
      return success;
    } catch (err) {
      console.error('Error converting user:', err);
      return false;
    }
  };

  // Context value
  const value: AnonymousUserContextType = {
    anonymousUser,
    isLoading,
    error,
    refreshUser,
    convertToRegistered
  };

  return (
    <AnonymousUserContext.Provider value={value}>
      {children}
    </AnonymousUserContext.Provider>
  );
};

// Hook for using the anonymous user context
export const useAnonymousUser = (): AnonymousUserContextType => {
  const context = useContext(AnonymousUserContext);
  if (!context) {
    throw new Error('useAnonymousUser must be used within an AnonymousUserProvider');
  }
  return context;
};