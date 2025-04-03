import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/drama';

type LoadingScreenRouteProp = RouteProp<RootStackParamList, 'LoadingScreen'>;

/**
 * Loading screen component with optional message
 * Can be used as a standalone screen or embedded in other components
 */
const LoadingScreen: React.FC<{ message?: string, fullScreen?: boolean }> = ({ message, fullScreen = true }) => {
  // If used as a screen, get message from route params
  const route = useRoute<LoadingScreenRouteProp>();
  const displayMessage = message || (route.params?.message ?? 'Loading...');
  
  return (
    <View style={[styles.container, fullScreen ? styles.fullScreen : {}]}>
      <ActivityIndicator size="large" color="#6A5ACD" />
      {displayMessage && (
        <Text style={styles.message}>{displayMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  }
});

export default LoadingScreen;