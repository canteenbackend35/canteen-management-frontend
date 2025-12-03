import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Link href="/auth/authCallback">Hello</Link> */}
      <Stack
        screenOptions={{
          headerShown: false, // hides default header for cleaner look
          animation: "slide_from_right",
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
