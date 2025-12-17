export const colors = {
  // Primary colors - Automotive Red
  primary: '#DC2626', // Racing red
  primaryDark: '#991B1B',
  primaryLight: '#EF4444',

  // Secondary colors - Automotive inspired
  secondary: '#1F2937', // Carbon gray
  accent: '#F59E0B', // Amber warning
  steel: '#64748B', // Steel blue-gray

  // Status colors
  success: '#10B981', // Modern green
  warning: '#F59E0B', // Amber
  error: '#DC2626', // Matches primary for OBD error focus
  info: '#3B82F6', // Electric blue
  critical: '#7F1D1D', // Deep red for critical errors

  // Neutral colors - Darker, more sophisticated
  background: '#F8FAFC', // Lighter gray
  backgroundDark: '#0F172A', // Dark mode background
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  card: '#FFFFFF',

  // Text colors
  text: '#0F172A', // Darker, better contrast
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textLight: '#FFFFFF',

  // Border colors
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  borderDark: '#475569',

  // Tab bar
  tabBarActive: '#DC2626',
  tabBarInactive: '#94A3B8',
  tabBarBackground: '#FFFFFF',

  // Gradients (represented as hex, will use in LinearGradient)
  gradientStart: '#DC2626',
  gradientEnd: '#991B1D',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
