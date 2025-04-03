import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/drama';

type LoadingScreenRouteProp = RouteProp<RootStackParamList, 'Loading'>;

interface LoadingScreenProps {
  route?: LoadingScreenRouteProp;
  message?: string;
}

/**
 * Loading screen component with customizable message
 * Used for showing loading states across the app
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ route, message }) => {
  // Use route params message if provided, otherwise use prop message or default
  const displayMessage = route?.params?.message || message || 'Loading content...';

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E50914" />
      <Text style={styles.text}>{displayMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default LoadingScreen;