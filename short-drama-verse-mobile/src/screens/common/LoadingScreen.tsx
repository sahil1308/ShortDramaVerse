import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/types/drama';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Loading Screen Component
 * Used for displaying loading states and transitions between screens
 * Can display custom loading messages passed through route params
 */
type LoadingScreenProps = NativeStackScreenProps<RootStackParamList, 'LoadingScreen'>;

const LoadingScreen: React.FC<LoadingScreenProps> = ({ route }) => {
  // Get custom message from route params or use default
  const message = route.params?.message || 'Loading...';
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8E44AD" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0C10',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#C5C6C7',
    textAlign: 'center',
  },
});

export default LoadingScreen;