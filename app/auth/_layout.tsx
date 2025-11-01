import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false, // hides default header for cleaner look
          animation: "slide_from_right",
        }}
      />
    </SafeAreaView>
  );
}
