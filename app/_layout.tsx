import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { darkTheme, lightTheme } from "../constants/theme";
import { CartProvider } from "../context/CartContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <CartProvider>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
            backgroundColor={theme.colors.surface}
          />

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background }
            }}
          />
        </CartProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
