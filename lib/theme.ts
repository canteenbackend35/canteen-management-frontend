import { TextStyle, ViewStyle } from "react-native";
import { MD3LightTheme } from "react-native-paper";

/**
 * ===================================
 * STANDARDIZED DESIGN SYSTEM
 * ===================================
 * This file contains all design tokens and reusable styles
 * for the entire application. Use these constants instead
 * of hardcoding values to maintain consistency.
 */

// ============ COLOR SYSTEM ============

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

export const COLORS = {
  primary: '#6366F1',       // Indigo-500
  primaryDark: '#4F46E5',   // Indigo-600
  primaryLight: '#818CF8',  // Indigo-400
  
  secondary: '#8B5CF6',     // Violet-500
  secondaryDark: '#7C3AED', // Violet-600
  secondaryLight: '#A78BFA', // Violet-400
  
  success: '#10B981',       // Emerald-500
  warning: '#F59E0B',       // Amber-500
  error: '#EF4444',         // Red-500
  info: '#3B82F6',          // Blue-500
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F9FAFB',       // Gray-50
  surfaceVariant: '#F3F4F6', // Gray-100
  outline: '#E5E7EB',       // Gray-200
  
  // Text colors
  onPrimary: '#FFFFFF',
  onSurface: '#111827',     // Gray-900
  onSurfaceVariant: '#6B7280', // Gray-500
  onBackground: '#111827',
  
  // Semantic colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#D1D5DB',      // Gray-300
};

// ============ SPACING SYSTEM ============

export const SPACING = {
  XXS: 2,
  XS: 4,
  S: 8,
  M: 12,
  L: 16,
  XL: 24,
  XXL: 32,
  XXXL: 40,
};

// ============ TYPOGRAPHY SYSTEM ============

export const TYPOGRAPHY = {
  // Display/Hero
  DISPLAY: { 
    fontSize: 32, 
    fontWeight: '900', 
    letterSpacing: -1.5,
    lineHeight: 40,
  } as const,
  
  // Headings
  H1: { 
    fontSize: 28, 
    fontWeight: '900', 
    letterSpacing: -1.5,
    lineHeight: 36,
  } as const,
  
  H2: { 
    fontSize: 22, 
    fontWeight: '900', 
    letterSpacing: -1,
    lineHeight: 28,
  } as const,
  
  H3: { 
    fontSize: 18, 
    fontWeight: '800', 
    letterSpacing: -0.5,
    lineHeight: 24,
  } as const,
  
  // Subtitles
  SUBTITLE: { 
    fontSize: 16, 
    fontWeight: '700', 
    letterSpacing: -0.25,
    lineHeight: 22,
  } as const,
  
  SUBTITLE_SMALL: { 
    fontSize: 14, 
    fontWeight: '600', 
    letterSpacing: 0,
    lineHeight: 20,
  } as const,
  
  // Body
  BODY: { 
    fontSize: 15, 
    fontWeight: '400', 
    letterSpacing: 0,
    lineHeight: 22,
  } as const,
  
  BODY_BOLD: { 
    fontSize: 15, 
    fontWeight: '700', 
    letterSpacing: 0,
    lineHeight: 22,
  } as const,
  
  BODY_SEMIBOLD: { 
    fontSize: 15, 
    fontWeight: '600', 
    letterSpacing: 0,
    lineHeight: 22,
  } as const,
  
  BODY_SMALL: { 
    fontSize: 13, 
    fontWeight: '400', 
    letterSpacing: 0,
    lineHeight: 18,
  } as const,
  
  BODY_SMALL_BOLD: { 
    fontSize: 13, 
    fontWeight: '700', 
    letterSpacing: 0,
    lineHeight: 18,
  } as const,
  
  // Caption/Labels
  CAPTION: { 
    fontSize: 12, 
    fontWeight: '600', 
    letterSpacing: 0.25,
    lineHeight: 16,
  } as const,
  
  CAPTION_BOLD: { 
    fontSize: 12, 
    fontWeight: '800', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
    lineHeight: 16,
  } as const,
  
  LABEL: { 
    fontSize: 11, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.75,
    lineHeight: 16,
  } as const,
  
  // Tiny
  TINY: { 
    fontSize: 10, 
    fontWeight: '600', 
    letterSpacing: 0.25,
    lineHeight: 14,
  } as const,
  
  TINY_BOLD: { 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 0.5,
    lineHeight: 14,
  } as const,
};

// ============ BORDER RADIUS ============

export const RADIUS = {
  NONE: 0,
  XS: 4,
  S: 8,
  M: 12,
  L: 16,
  XL: 20,
  XXL: 24,
  XXXL: 28,
  FULL: 9999,
};

// ============ SHADOWS ============

export const SHADOWS = {
  NONE: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  XL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============ COMPONENT STYLES ============

/**
 * Reusable component-level styles
 * Use these for common UI patterns
 */
export const COMPONENT_STYLES = {
  // Container styles
  container: {
    flex: 1,
  } as ViewStyle,
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  // Header styles
  header: {
    paddingTop: 40,
    paddingBottom: SPACING.L,
    paddingHorizontal: SPACING.L,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  } as ViewStyle,
  
  headerTitle: {
    ...TYPOGRAPHY.H3,
  } as TextStyle,
  
  headerSubtitle: {
    ...TYPOGRAPHY.CAPTION,
    opacity: 0.6,
  } as TextStyle,
  
  // Card styles
  card: {
    borderRadius: RADIUS.L,
    marginHorizontal: SPACING.L,
    marginBottom: SPACING.M,
    overflow: 'hidden',
    borderWidth: 1,
  } as ViewStyle,
  
  cardLarge: {
    borderRadius: RADIUS.XXL,
    marginBottom: SPACING.L,
    overflow: 'hidden',
  } as ViewStyle,
  
  // Button styles
  button: {
    borderRadius: RADIUS.M,
    paddingHorizontal: SPACING.L,
  } as ViewStyle,
  
  buttonLarge: {
    borderRadius: RADIUS.L,
    paddingHorizontal: SPACING.XL,
  } as ViewStyle,
  
  buttonContent: {
    height: 48,
  } as ViewStyle,
  
  buttonLabel: {
    ...TYPOGRAPHY.BODY_BOLD,
  } as TextStyle,
  
  buttonLabelSmall: {
    ...TYPOGRAPHY.CAPTION_BOLD,
  } as TextStyle,
  
  // Input styles
  input: {
    borderRadius: RADIUS.M,
    marginBottom: SPACING.L,
  } as ViewStyle,
  
  // List styles
  listContent: {
    paddingBottom: SPACING.XXL,
    paddingTop: SPACING.M,
  } as ViewStyle,
  
  listHeader: {
    marginBottom: SPACING.XL,
    marginTop: SPACING.L,
    paddingHorizontal: SPACING.L,
  } as ViewStyle,
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: SPACING.XL,
  } as ViewStyle,
  
  emptyText: {
    ...TYPOGRAPHY.SUBTITLE,
    textAlign: 'center',
    marginTop: SPACING.S,
    marginBottom: SPACING.XL,
  } as TextStyle,
  
  // Badge styles
  badge: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.M,
  } as ViewStyle,
  
  badgeText: {
    ...TYPOGRAPHY.LABEL,
  } as TextStyle,
  
  // Modal styles
  modalContent: {
    margin: SPACING.L,
    padding: SPACING.L,
    borderRadius: RADIUS.XXL,
    maxHeight: '85%',
    maxWidth: 500,
    alignSelf: 'center',
    width: '95%',
  } as ViewStyle,
  
  modalTitle: {
    ...TYPOGRAPHY.H3,
    marginBottom: SPACING.M,
  } as TextStyle,
  
  // Section styles
  section: {
    marginBottom: SPACING.XL,
  } as ViewStyle,
  
  sectionTitle: {
    ...TYPOGRAPHY.CAPTION_BOLD,
    opacity: 0.6,
    marginBottom: SPACING.M,
  } as TextStyle,
  
  // Row styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  
  // Divider
  divider: {
    marginVertical: SPACING.M,
  } as ViewStyle,
};

// ============ ANIMATION ============

export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
};

// ============ REACT NATIVE PAPER THEME ============

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primaryLight,
    secondary: COLORS.secondary,
    secondaryContainer: COLORS.secondaryLight,
    error: COLORS.error,
    surface: COLORS.surface,
    surfaceVariant: COLORS.surfaceVariant,
    background: COLORS.background,
    outline: COLORS.outline,
    onPrimary: COLORS.onPrimary,
    onSurface: COLORS.onSurface,
    onSurfaceVariant: COLORS.onSurfaceVariant,
    onBackground: COLORS.onBackground,
  },
  custom: {
    warning: STATUS_COLORS.PENDING,
    success: STATUS_COLORS.DELIVERED,
    info: STATUS_COLORS.READY,
  }
};
