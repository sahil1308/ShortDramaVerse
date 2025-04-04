/**
 * ShortDramaVerse Mobile App
 * 
 * The main application component that sets up providers and navigation.
 */
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Import root navigator
import RootNavigator from '@/navigation/RootNavigator';

// Import theme
import { paperTheme } from '@/constants/theme';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested',
    'Failed prop type',
    'Non-serializable values were found in the navigation state',
  ]);
}

/**
 * App Component
 * 
 * Root component that sets up providers and the navigation container.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="auto" />
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}