import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { darkTheme, lightTheme } from "../constants/theme";
import { CartProvider } from "../context/CartContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
        <SafeAreaProvider style={styles.webShell}>
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
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webShell: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '100%', // Elegant mobile-width on desktop
    height: '100%',
    backgroundColor: '#000', // Just in case
    // Add a shadow on web for a "Floating App" feel
    ...Platform.select({
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
      }
    })
  }
});
