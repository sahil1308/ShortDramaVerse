import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/drama';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * A reusable loading screen component that displays an activity indicator
 * and an optional message. Can be used as a full screen or as part of another view.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  return (
    <View style={[
      styles.container, 
      fullScreen ? styles.fullScreen : styles.partialScreen
    ]}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.message}>{message}</Text>
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
    backgroundColor: '#fff',
  },
  partialScreen: {
    height: 200,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default LoadingScreen;