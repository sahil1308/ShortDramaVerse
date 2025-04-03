import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { View, Text, StyleSheet } from 'react-native';
import { QueryProvider } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Load any resources or data needed for the app
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          ...Ionicons.font,
        });
        setFontsLoaded(true);
        
        // Artificially delay for 1 second to make splash screen more noticeable
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  // Once everything is ready, hide the splash screen
  const onLayoutRootView = useCallback(async () => {
    if (isReady && fontsLoaded) {
      // Hide the splash screen
      await SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  if (!isReady || !fontsLoaded) {
    return null;
  }

  // Main app component
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <View style={styles.container} onLayout={onLayoutRootView}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <StatusBar style="light" />
          </View>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});