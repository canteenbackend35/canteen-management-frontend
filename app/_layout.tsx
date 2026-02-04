import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { darkTheme, lightTheme } from "../constants/theme";
import { CartProvider } from "../context/CartContext";

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const [fontsLoaded] = useFonts({
    // Load Material Community Icons font
    'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
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
    height: '100%',
    backgroundColor: '#000',
  }
});
