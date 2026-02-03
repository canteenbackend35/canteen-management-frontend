import { authService } from "@/features/auth/services/authService";
import * as Haptics from 'expo-haptics';
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const handleSignup = async () => {
    setErrorMsg(null);
    
    if (name.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (college.trim().length < 2) {
      setErrorMsg("Please enter your college name.");
      return;
    }

    if (course.trim().length < 2) {
      setErrorMsg("Please enter your course name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setErrorMsg("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        phoneNo: phone,
        role: "customer",
        name, 
        email, 
        college,
        course
      }; 
      const response = await authService.signup(payload);

      if (!response.success) {
        throw new Error(response.UImessage || "Signup failed");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Immediately open OTP entry page
      router.push({
        pathname: "/auth/wait",
        params: { phone, reqId: response.reqId },
      });
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong. Try again.");
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
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Join Canteen</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Create an account to start ordering.</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              placeholder="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMsg) setErrorMsg(null);
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              left={<TextInput.Icon icon="account-outline" color={theme.colors.onSurfaceVariant} />}
            />

            <TextInput
              mode="outlined"
              placeholder="Email Address"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMsg) setErrorMsg(null);
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              left={<TextInput.Icon icon="email-outline" color={theme.colors.onSurfaceVariant} />}
            />

            <TextInput
              mode="outlined"
              placeholder="College Name"
              value={college}
              onChangeText={(text) => {
                setCollege(text);
                if (errorMsg) setErrorMsg(null);
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              left={<TextInput.Icon icon="school-outline" color={theme.colors.onSurfaceVariant} />}
            />

            <TextInput
              mode="outlined"
              placeholder="Course (e.g. B.Tech CS)"
              value={course}
              onChangeText={(text) => {
                setCourse(text);
                if (errorMsg) setErrorMsg(null);
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              left={<TextInput.Icon icon="book-outline" color={theme.colors.onSurfaceVariant} />}
            />

            <View style={styles.phoneInputRow}>
              <View style={[styles.prefixBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <Text style={[styles.prefixText, { color: theme.colors.onSurface }]}>+91</Text>
              </View>
              <TextInput
                mode="outlined"
                placeholder="Phone Number"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                style={[styles.phoneInput, { backgroundColor: theme.colors.surface }]}
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
              onPress={handleSignup}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor={theme.colors.primary}
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </View>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.colors.onSurfaceVariant }]}>Already have an account? </Text>
            <Link href="/auth" replace style={[styles.loginLink, { color: theme.colors.primary }]}>
              Login
            </Link>
          </View>
        </View>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 12,
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
  phoneInput: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "700",
  },
});
