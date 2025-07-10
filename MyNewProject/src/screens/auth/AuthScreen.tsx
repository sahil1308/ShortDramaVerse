/**
 * Authentication Screen
 * 
 * Handles user login and registration with form switching.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { colors, spacing, typography, shadows } from '@/constants/theme';

// Form type definition
type FormType = 'login' | 'register' | 'forgotPassword';

/**
 * Authentication Screen Component
 * 
 * @returns Auth screen JSX
 */
const AuthScreen = () => {
  // Navigation
  const navigation = useNavigation();
  
  // Analytics
  const { trackScreenView, trackLoginAttempt, trackRegistrationAttempt } = useAnalytics();
  
  // Auth hook
  const { user, login, register, isLoading, error } = useAuth();
  
  // State
  const [formType, setFormType] = useState<FormType>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Track screen view
  useEffect(() => {
    trackScreenView('Auth', { form_type: formType });
  }, [formType, trackScreenView]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigation.navigate('Home');
    }
  }, [user, navigation]);
  
  // Switch between form types (login, register, forgot password)
  const switchForm = (type: FormType) => {
    setFormType(type);
    // Clear form fields and errors
    setFormErrors({});
    if (type !== 'register') {
      setEmail('');
      setConfirmPassword('');
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (formType === 'register') {
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid';
      }
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formType === 'register' && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (formType === 'login') {
        trackLoginAttempt();
        await login(username, password);
      } else if (formType === 'register') {
        trackRegistrationAttempt();
        await register(username, email, password);
      } else if (formType === 'forgotPassword') {
        // Implement forgot password functionality
        Alert.alert(
          'Password Reset',
          'If the email address is associated with an account, you will receive reset instructions.',
          [{ text: 'OK', onPress: () => switchForm('login') }]
        );
      }
    } catch (err) {
      // Error handling is managed by the useAuth hook
    }
  };
  
  // Render error message
  const renderError = (field: string) => {
    if (formErrors[field]) {
      return <Text style={styles.errorText}>{formErrors[field]}</Text>;
    }
    return null;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            {/* Logo and Title */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>ShortDramaVerse</Text>
              <Text style={styles.tagline}>Your gateway to world's best short-form drama</Text>
            </View>
            
            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Form Title */}
              <Text style={styles.formTitle}>
                {formType === 'login' ? 'Log In'
                  : formType === 'register' ? 'Create Account'
                  : 'Reset Password'}
              </Text>
              
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={colors.gray}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {renderError('username')}
              </View>
              
              {/* Email Input (Register & Forgot Password only) */}
              {(formType === 'register' || formType === 'forgotPassword') && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.gray}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {renderError('email')}
                </View>
              )}
              
              {/* Password Input (Login & Register only) */}
              {(formType === 'login' || formType === 'register') && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.gray}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  {renderError('password')}
                </View>
              )}
              
              {/* Confirm Password Input (Register only) */}
              {formType === 'register' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.gray}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                  {renderError('confirmPassword')}
                </View>
              )}
              
              {/* Forgot Password Link (Login only) */}
              {formType === 'login' && (
                <TouchableOpacity 
                  style={styles.forgotPasswordLink}
                  onPress={() => switchForm('forgotPassword')}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
              
              {/* Server Error Message */}
              {error && (
                <Text style={styles.serverErrorText}>{error}</Text>
              )}
              
              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {formType === 'login' ? 'Log In'
                      : formType === 'register' ? 'Create Account'
                      : 'Reset Password'}
                  </Text>
                )}
              </TouchableOpacity>
              
              {/* Form Switch Links */}
              <View style={styles.formSwitchContainer}>
                {formType === 'login' ? (
                  <Text style={styles.formSwitchText}>
                    Don't have an account?{' '}
                    <Text
                      style={styles.formSwitchLink}
                      onPress={() => switchForm('register')}
                    >
                      Sign Up
                    </Text>
                  </Text>
                ) : (
                  <Text style={styles.formSwitchText}>
                    Already have an account?{' '}
                    <Text
                      style={styles.formSwitchLink}
                      onPress={() => switchForm('login')}
                    >
                      Log In
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.medium,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.onBackground,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: colors.darkGray,
  },
  input: {
    height: 50,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.onBackground,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  serverErrorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formSwitchContainer: {
    alignItems: 'center',
  },
  formSwitchText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  formSwitchLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default AuthScreen;