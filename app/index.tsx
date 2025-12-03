import { supabase } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const [authState, setAuthState] = useState("checking");
  // checking | redirectToUser | redirectToLogin

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log(data);

      if (!data.session) {
        // Token existed locally but Supabase says the session is invalid
        // → Clear invalid session and redirect to login
        setAuthState("redirectToLogin");
        return;
      }

      // 3️⃣ Session valid → redirect to /user
      setAuthState("redirectToUser");
    };

    checkAuth();
  }, []);

  // Show loading screen while checking
  if (authState === "checking") {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Logged in
  if (authState === "redirectToUser") {
    return <Redirect href="/user/dashboard" />;
  }

  // Not logged in
  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
