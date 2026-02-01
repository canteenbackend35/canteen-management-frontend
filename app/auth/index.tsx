import { API_ENDPOINTS, api } from "@/lib/api-client";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const handleContinue = async () => {
    // Basic 10-digit validation
    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      console.log("Sending OTP request to:", API_ENDPOINTS.USERS.LOGIN, "with phone:", phone);
      const response = await api.post(
        API_ENDPOINTS.USERS.LOGIN,
        { phone_no: phone },
        false
      );
      console.log("OTP Response received:", response);

      if (!response.success) {
        // If not successful and it's a 404 (user not found), redirect to signup
        if (response.UImessage?.includes("not registered")) {
          Alert.alert("Notice", response.UImessage);
          router.push("/auth/signup");
          return;
        }
        throw new Error(response.UImessage || "Failed to send OTP");
      }

      console.log("Navigating to /auth/wait with phone:", phone, "and reqId:", response.reqId);
      router.push({
        pathname: "/auth/wait",
        params: { phone, reqId: response.reqId },
      });
    } catch (error: any) {
      console.error("OTP Request failed:", error);
      setErrorMsg(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined} 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={[styles.brandTitle, { color: theme.colors.primary }]}>Canteen</Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.onSurfaceVariant }]}>Deliciousness delivered.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Enter your mobile number to continue</Text>

          <View style={styles.phoneInputRow}>
            <View style={[styles.prefixBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <Text style={[styles.prefixText, { color: theme.colors.onSurface }]}>+91</Text>
            </View>
            <TextInput
              mode="outlined"
              placeholder="000 000 0000"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errorMsg) setErrorMsg(null);
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
          </View>

          {errorMsg && (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorMsg}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={theme.colors.primary}
            loading={loading}
            disabled={loading}
          >
            Get OTP
          </Button>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: theme.colors.onSurfaceVariant }]}>New to Canteen? </Text>
            <Link style={[styles.signupLink, { color: theme.colors.primary }]} href="/auth/signup" replace>
              Create Account
            </Link>
          </View>
        </View>

        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant, opacity: 0.6 }]}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
  },
  brandSubtitle: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: "600",
  },
  formContainer: {
    width: "100%",
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 32,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  prefixBox: {
    height: 56,
    width: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 6,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    flex: 1,
  },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    borderRadius: 16,
    elevation: 0,
  },
  buttonContent: {
    height: 56,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  signupText: {
    fontSize: 16,
    fontWeight: "500",
  },
  signupLink: {
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
    fontWeight: "500",
  },
});

