import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface EmptyStateViewProps {
  title: string;
  message: string;
  icon?: 'search' | 'watchlist' | 'history' | 'download' | 'error' | 'network';
  actionText?: string;
  onAction?: () => void;
}

/**
 * A reusable component to display empty states throughout the app
 * with consistent styling and behavior
 */
const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  message,
  icon = 'search',
  actionText,
  onAction,
}) => {
  // Get appropriate icon based on the type
  const getIcon = () => {
    switch (icon) {
      case 'watchlist':
        return <MaterialIcons name="bookmark-border" size={80} color="#ccc" />;
      case 'history':
        return <MaterialIcons name="history" size={80} color="#ccc" />;
      case 'download':
        return <MaterialIcons name="file-download" size={80} color="#ccc" />;
      case 'error':
        return <MaterialIcons name="error-outline" size={80} color="#ccc" />;
      case 'network':
        return <Ionicons name="cloud-offline-outline" size={80} color="#ccc" />;
      case 'search':
      default:
        return <MaterialIcons name="search" size={80} color="#ccc" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmptyStateView;