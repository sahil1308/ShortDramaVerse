import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/drama';
import { useAuth } from '@/hooks/useAuth';
import { StatusBar } from 'expo-status-bar';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

/**
 * SignIn Screen
 * Handles user authentication and navigation to register screen
 */
const SignIn: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { login, loginLoading, isAuthenticated, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Clear errors when input changes
  useEffect(() => {
    if (username) setUsernameError(null);
    if (password) setPasswordError(null);
    if (error) clearError();
  }, [username, password, error, clearError]);
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    }
  }, [isAuthenticated, navigation]);
  
  // Validate form before submission
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Handle login attempt
  const handleLogin = async () => {
    if (validateForm()) {
      Keyboard.dismiss();
      try {
        await login(username, password);
      } catch (err) {
        Alert.alert('Login Failed', 'Failed to login. Please try again.');
      }
    }
  };
  
  // Navigate to sign up screen
  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>ShortDramaVerse</Text>
            <Text style={styles.tagline}>Your pocket drama companion</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>
            
            {error && <Text style={styles.errorMessage}>{error}</Text>}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, usernameError && styles.inputError]}
                placeholder="Enter your username"
                placeholderTextColor="#6c757d"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, passwordError && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor="#6c757d"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={navigateToSignUp}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8E44AD', // Purple theme color
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#C5C6C7',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#1F2833',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#C5C6C7',
  },
  input: {
    backgroundColor: '#2C3541',
    height: 50,
    borderRadius: 5,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#8E44AD',
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#C5C6C7',
    marginRight: 5,
  },
  signupLink: {
    color: '#8E44AD',
    fontWeight: 'bold',
  },
});

export default SignIn;