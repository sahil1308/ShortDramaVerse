import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/types/drama';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Colors constants
const colors = {
  primary: '#E50914',
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
};

// Default loading messages
const DEFAULT_LOADING_MESSAGE = 'Loading...';

type LoadingScreenProps = NativeStackScreenProps<RootStackParamList, 'LoadingScreen'>;

export default function LoadingScreen({ route }: LoadingScreenProps) {
  // Get message from route params or use default
  const message = route?.params?.message || DEFAULT_LOADING_MESSAGE;
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
});