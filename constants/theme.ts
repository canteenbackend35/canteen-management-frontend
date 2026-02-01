import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// High-quality palette
const colors = {
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  secondary: "#10B981",
  error: "#DC2626",
  warning: "#F59E0B",
  info: "#3B82F6",
  success: "#4CAF50",
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    surface: "#FFFFFF",
    background: "#F9FAFB",
    onSurface: "#111827",
    onSurfaceVariant: "#6B7280",
    outline: "#E5E7EB",
    surfaceVariant: "#F3F4F6",
  },
  custom: {
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    cardShadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    }
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    surface: "#111827",
    background: "#030712",
    onSurface: "#F9FAFB",
    onSurfaceVariant: "#9CA3AF",
    outline: "#374151",
    surfaceVariant: "#1F2937",
  },
  custom: {
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    cardShadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 4,
    }
  }
};
