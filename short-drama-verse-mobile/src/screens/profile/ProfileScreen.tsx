/**
 * Profile Screen Component
 * 
 * Displays user profile information, account details, and settings.
 * Handles both anonymous and registered users.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '@/hooks/useAuth';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import { subscriptionService } from '@/services/subscription';
import { coinService } from '@/services/coin';
import { RootStackParamList } from '@/types/navigation';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, isAuthenticated, logout } = useAuth();
  const { anonymousUser } = useAnonymousUser();
  
  // Function to handle navigation to auth screen
  const handleAuth = () => {
    navigation.navigate('Auth');
  };
  
  // Function to handle navigation to settings
  const handleSettings = () => {
    navigation.navigate('Settings');
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {isAuthenticated && user ? (
            // Registered user profile
            <>
              {user.profilePicture ? (
                <Image 
                  source={{ uri: user.profilePicture }} 
                  style={styles.profilePicture} 
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>{user.displayName || user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
            </>
          ) : (
            // Anonymous user profile
            <>
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>Guest User</Text>
                <Text style={styles.anonymousId}>
                  ID: {anonymousUser ? anonymousUser.id.substring(0, 8) + '...' : 'Loading...'}
                </Text>
              </View>
            </>
          )}
        </View>
        
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.authButton} 
            onPress={handleAuth}
          >
            <Text style={styles.authButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings', { screen: 'Notifications' })}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              Alert.alert(
                "Confirm Logout",
                "Are you sure you want to log out?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout", style: "destructive", onPress: logout }
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
            <Text style={[styles.menuItemText, { color: '#ff3b30' }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Subscription section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Subscription')}>
          <Ionicons name="card-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Manage Subscription</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CoinStore')}>
          <Ionicons name="coin-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Buy Coins</Text>
          <View style={styles.badge}>
            <Ionicons name="coin" size={16} color="#FFD700" />
            <Text style={styles.badgeText}>0</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Content section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Downloads')}>
          <Ionicons name="download-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Downloads</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Watch History</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      {/* Support section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('About')}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.menuItemText}>About ShortDramaVerse</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profilePicturePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0000ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 15,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  anonymousId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  authButton: {
    backgroundColor: '#0000ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontSize: 14,
  },
});

export default ProfileScreen;