/**
 * Empty State View Component for ShortDramaVerse Mobile
 * 
 * This component displays a user-friendly message and action button
 * when there is no content to display in a list or section.
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Props for the EmptyStateView component
 */
interface EmptyStateViewProps {
  icon: string;                      // Icon name from MaterialIcons
  message: string;                   // Message to display
  actionText?: string;               // Text for the action button (optional)
  onAction?: () => void;             // Action button callback (optional)
  iconSize?: number;                 // Size of the icon (optional)
  iconColor?: string;                // Color of the icon (optional)
  style?: object;                    // Additional style for the container (optional)
}

/**
 * Empty State View Component
 * 
 * Displays a placeholder with icon, message and optional action button
 * when there is no content to display.
 * 
 * @param props - EmptyStateView props
 * @returns Empty state view component
 */
const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  icon,
  message,
  actionText,
  onAction,
  iconSize = 64,
  iconColor = '#CCCCCC',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <MaterialIcons name={icon} size={iconSize} color={iconColor} />
      
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmptyStateView;