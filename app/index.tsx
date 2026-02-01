import { api, API_ENDPOINTS } from "@/lib/api-client";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function Index() {
  const [authState, setAuthState] = useState("checking");
  const theme = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get(API_ENDPOINTS.USERS.PROFILE);
        setAuthState("redirectToUser");
      } catch {
        console.log("No valid session found in cookies");
        setAuthState("redirectToLogin");
      }
    };

    checkAuth();
  }, []);

  if (authState === "checking") {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (authState === "redirectToUser") {
    return <Redirect href="/user/dashboard" />;
  }

  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
