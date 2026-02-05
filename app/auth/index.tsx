import { authService } from "@/features/auth/services/authService";
import { loginSchema } from "@/lib/validators";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "store">("customer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const handleContinue = async () => {
    // Validate with Zod
    const validation = loginSchema.safeParse({ phoneNo: phone, role });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      console.log("Sending login request with phone:", phone, "role:", role);
      const response = await authService.login(phone, role);
      console.log("Login Response received:", response);

      if (!response.success) {
        // If not successful and it's a 404 (user not found), redirect to signup
        if (response.UImessage?.includes("not registered")) {
          Alert.alert("Notice", response.UImessage);
          router.push("/auth/signup");
          return;
        }
        throw new Error(response.UImessage || "Failed to send OTP");
      }

      console.log("Navigating to /auth/wait with phone:", phone, "reqId:", response.reqId, "role:", role);
      router.push({
        pathname: "/auth/wait",
        params: { phone, reqId: response.reqId, role },
      });
    } catch (error: any) {
      console.error("Login Request failed:", error);
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
          <Text style={[styles.brandTitle, { color: theme.colors.primary }]}>CraveCart</Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.onSurfaceVariant }]}>Canteen, but faster.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Choose your role and enter mobile number</Text>

          <View style={styles.roleContainer}>
            <Button 
              mode={role === "customer" ? "contained" : "outlined"} 
              onPress={() => setRole("customer")}
              style={styles.roleButton}
              labelStyle={styles.roleButtonLabel}
            >
              Customer
            </Button>
            <Button 
              mode={role === "store" ? "contained" : "outlined"} 
              onPress={() => setRole("store")}
              style={styles.roleButton}
              labelStyle={styles.roleButtonLabel}
            >
              Store
            </Button>
          </View>

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
            <Text style={[styles.signupText, { color: theme.colors.onSurfaceVariant }]}>New to CraveCart? </Text>
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
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  brandSubtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: "600",
  },
  formContainer: {
    width: "100%",
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
  },
  roleButtonLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  prefixBox: {
    height: 50,
    width: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    borderRadius: 12,
    elevation: 0,
  },
  buttonContent: {
    height: 50,
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

