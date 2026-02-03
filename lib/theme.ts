import { MD3LightTheme } from "react-native-paper";

/**
 * Standardized status colors used across the application.
 * Centralizing these prevents color mismatches between kitchen and user views.
 */
export const STATUS_COLORS = {
  PENDING: '#F59E0B',    // Amber-500
  CONFIRMED: '#6366F1',  // Indigo-500
  PREPARING: '#8B5CF6',  // Violet-500
  READY: '#3B82F6',      // Blue-500
  DELIVERED: '#10B981',  // Emerald-500
  CANCELLED: '#EF4444',  // Red-500
  COMPLETED: '#10B981',  // Emerald-500 (Alias for DELIVERED)
};

export const SPACING = {
  XS: 4,
  S: 8,
  M: 12,
  L: 16,
  XL: 24,
  XXL: 32,
};

export const TYPOGRAPHY = {
  H1: { fontSize: 28, fontWeight: '900', letterSpacing: -1 } as const,
  H2: { fontSize: 22, fontWeight: '900', letterSpacing: -1 } as const,
  SUBTITLE: { fontSize: 13, fontWeight: '600', opacity: 0.7 } as const,
  CAPTION: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 } as const,
  BODY_BOLD: { fontSize: 14, fontWeight: '800' } as const,
};

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    secondary: '#8B5CF6',
    error: '#EF4444',
  },
  custom: {
    warning: STATUS_COLORS.PENDING,
    success: STATUS_COLORS.DELIVERED,
    info: STATUS_COLORS.READY,
  }
};
