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
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        
        // Match backend structure: { success: true, role, user }
        const isStore = response.role === 'store' || (response.user && response.user.store_id);

        if (isStore) {
          setAuthState("redirectToStore");
        } else {
          setAuthState("redirectToUser");
        }
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

  if (authState === "redirectToStore") {
    return <Redirect href="/(protected)/store/kitchen" />;
  }

  if (authState === "redirectToUser") {
    return <Redirect href="/(protected)/user/stores" />;
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
