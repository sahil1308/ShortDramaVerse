/**
 * Theme Configuration
 * 
 * This file contains the theme configuration for the application.
 * It defines colors, fonts, spacing, and other design elements.
 */
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Brand colors
export const COLORS = {
  // Primary brand colors
  primary: '#FF3D71',
  primaryLight: '#FF7095',
  primaryDark: '#D40D4C',
  
  // Secondary brand colors
  secondary: '#7928CA',
  secondaryLight: '#9458E9',
  secondaryDark: '#5C14A3',
  
  // Accent colors
  accent: '#00D68F',
  accentLight: '#33E2A9',
  accentDark: '#00A873',
  
  // Text colors
  textPrimary: '#222B45',
  textSecondary: '#8F9BB3',
  textDisabled: '#C5CEE0',
  textWhite: '#FFFFFF',
  
  // Background colors
  background: '#F7F9FC',
  backgroundDark: '#222B45',
  surface: '#FFFFFF',
  surfaceDark: '#2E3A59',
  
  // Additional utility colors
  success: '#00E096',
  warning: '#FFAA00',
  error: '#FF3D71',
  info: '#0095FF',
  
  // Gradient colors
  gradientStart: '#FF3D71',
  gradientEnd: '#7928CA',
  
  // Dark/Night mode specific colors
  darkBackground: '#151A30',
  darkSurface: '#222B45',
};

// Font configuration
export const FONTS = {
  regular: {
    fontFamily: 'Inter-Regular',
    fontWeight: 'normal' as const,
  },
  medium: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500' as const,
  },
  semiBold: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as const,
  },
  bold: {
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold' as const,
  },
  
  // Font sizes
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    heading: 28,
    subheading: 22,
  },
};

// Spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  
  // Specific spacing
  screenPadding: 16,
  cardPadding: 12,
  listItemPadding: 8,
  sectionSpacing: 32,
};

// Border radius values
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

// Shadows for iOS and Android
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Custom theme extending Paper's MD3 theme
export const LightTheme = {
  ...MD3LightTheme,
  ...NavigationLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationLightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
    text: COLORS.textPrimary,
    onBackground: COLORS.textPrimary,
    onSurface: COLORS.textPrimary,
    notification: COLORS.accent,
    card: COLORS.surface,
    border: COLORS.textDisabled,
  },
  roundness: BORDER_RADIUS.md,
  animation: {
    scale: 1.0,
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: COLORS.primaryLight,
    secondary: COLORS.secondaryLight,
    background: COLORS.darkBackground,
    surface: COLORS.darkSurface,
    error: COLORS.error,
    text: COLORS.textWhite,
    onBackground: COLORS.textWhite,
    onSurface: COLORS.textWhite,
    notification: COLORS.accent,
    card: COLORS.darkSurface,
    border: COLORS.textSecondary,
  },
  roundness: BORDER_RADIUS.md,
  animation: {
    scale: 1.0,
  },
};