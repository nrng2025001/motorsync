import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

/**
 * Professional automotive theme configuration
 * Uses neutral colors with automotive industry appeal
 */

// Custom color palette for automotive industry - using MD3 structure
const customColors = {
  primary: '#1565C0', // Professional blue
  onPrimary: '#FFFFFF',
  primaryContainer: '#E3F2FD',
  onPrimaryContainer: '#0D47A1',
  
  secondary: '#424242', // Charcoal gray
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F5F5F5',
  onSecondaryContainer: '#212121',
  
  tertiary: '#FF6F00', // Automotive orange accent
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFE0B2',
  onTertiaryContainer: '#E65100',
  
  error: '#D32F2F',
  onError: '#FFFFFF',
  errorContainer: '#FFEBEE',
  onErrorContainer: '#B71C1C',
  
  background: '#FAFAFA',
  onBackground: '#212121',
  surface: '#FFFFFF',
  onSurface: '#212121',
  surfaceVariant: '#F5F5F5',
  onSurfaceVariant: '#424242',
  
  outline: '#BDBDBD',
  outlineVariant: '#E0E0E0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#212121',
  inverseOnSurface: '#FAFAFA',
  inversePrimary: '#90CAF9',
  
  // Elevation colors for Material Design 3
  elevation: {
    level0: 'transparent',
    level1: '#F8F9FA',
    level2: '#F1F3F4',
    level3: '#E8EAED',
    level4: '#E1E3E6',
    level5: '#DADCE0',
  },
  
  // Custom colors for automotive context
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

// Custom font configuration using Jost
// Jost is a geometric sans-serif inspired by Futura with a clean, modern aesthetic
const fontConfig = {
  displayLarge: {
    fontFamily: 'Jost_400Regular',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'Jost_400Regular',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'Jost_400Regular',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'Jost_500Medium',
    fontSize: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'Jost_500Medium',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'Jost_500Medium',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'Jost_500Medium',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'Jost_500Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'Jost_500Medium',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'Jost_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'Jost_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'Jost_400Regular',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

// Main theme configuration
export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
  fonts: configureFonts({ config: fontConfig }),
} as MD3Theme & {
  colors: MD3Theme['colors'] & {
    success: string;
    warning: string;
    info: string;
    text: string;
    textSecondary: string;
  };
};

// Export individual colors for use in components
export const colors = customColors;


// Common spacing values used throughout the app
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Common border radius values
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 999,
};

// Enhanced shadows for better depth perception
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations for consistent UX
export const animations = {
  fast: 150,
  medium: 250,
  slow: 350,
};

// Touch target sizes for accessibility
export const touchTargets = {
  small: 32,
  medium: 44,
  large: 56,
};
