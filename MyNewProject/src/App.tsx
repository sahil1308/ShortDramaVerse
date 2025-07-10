/**
 * Main App Component
 * 
 * Root component that wraps the entire application with necessary providers
 * and handles initialization.
 */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import RootNavigator from '@/navigation/RootNavigator';

// Context providers
import { AuthProvider } from '@/hooks/useAuth';
import { AnonymousUserProvider } from '@/hooks/useAnonymousUser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Services
import { analyticsService } from '@/services/analytics';
import { storageService } from '@/services/storage';
import { apiService } from '@/services/api';
import { advertisingService } from '@/services/advertising';
import { deviceIdentifierService } from '@/services/deviceIdentifier';

// Initialize query client for API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Ignore specific warnings to reduce noise in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
]);

// Initialize required services
const initializeApp = async () => {
  // Initialize storage service first as other services depend on it
  await storageService.initialize();
  
  // Initialize device identifier service
  await deviceIdentifierService.initialize();
  
  // Initialize API service
  await apiService.initialize();
  
  // Initialize analytics service
  await analyticsService.initialize();
  
  // Initialize advertising service with test IDs for now
  await advertisingService.initialize({
    admob: {
      appId: __DEV__ ? 'ca-app-pub-3940256099942544~3347511713' : undefined,
      adUnitIds: __DEV__ ? {
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
        rewarded: 'ca-app-pub-3940256099942544/5224354917',
        native: 'ca-app-pub-3940256099942544/2247696110',
      } : undefined
    },
    applovin: {
      sdkKey: __DEV__ ? 'YOUR_APPLOVIN_TEST_SDK_KEY' : undefined,
      adUnitIds: __DEV__ ? {
        banner: 'YOUR_TEST_BANNER_ID',
        interstitial: 'YOUR_TEST_INTERSTITIAL_ID',
        rewarded: 'YOUR_TEST_REWARDED_ID',
        native: 'YOUR_TEST_NATIVE_ID',
      } : undefined
    }
  }).catch(err => {
    console.log('Ad initialization error (non-critical):', err);
    // Continue app initialization even if ads fail to initialize
  });
};

// Initialize app on startup
initializeApp().catch(console.error);

/**
 * Main App component with all providers
 */
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AnonymousUserProvider>
            <RootNavigator />
          </AnonymousUserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;