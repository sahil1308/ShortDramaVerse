/**
 * Loading Screen Component for ShortDramaVerse Mobile
 * 
 * This component provides a loading indicator screen with the app logo
 * while app resources are being initialized.
 */

import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  Text, 
  StyleSheet, 
  Image, 
  StatusBar 
} from 'react-native';

/**
 * Props for the LoadingScreen component
 */
interface LoadingScreenProps {
  message?: string;
}

/**
 * Loading Screen Component
 * 
 * Displays a loading screen with the app logo and an optional custom message.
 * Used during app initialization, authentication checks, and heavy data loading.
 * 
 * @param message - Optional loading message to display
 * @returns Loading screen component
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.logoContainer}>
        {/* Replace with your app logo */}
        <Text style={styles.logoText}>ShortDramaVerse</Text>
      </View>
      
      <ActivityIndicator size="large" color="#FF6B6B" style={styles.spinner} />
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default LoadingScreen;