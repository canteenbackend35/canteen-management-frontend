import { API_ENDPOINTS, api } from "@/lib/api-client";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // validation
    if (name.trim().length < 2) {
      Alert.alert("Invalid Name", "Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Enter a valid email.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Phone must be 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const payload = { name, email, phone_no: phone };

      // Hit signup API
      await api.post(API_ENDPOINTS.USERS.SIGNUP, payload, false);

      // Navigate to OTP screen (or login)
      router.push({
        pathname: "/auth/otp",
        params: { email },
      });
    } catch (error: any) {
      Alert.alert(
        "Signup Failed",
        error.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Create Account</Text>

      {/* Name */}
      <TextInput
        mode="outlined"
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* Email */}
      <TextInput
        mode="outlined"
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* Phone */}
      <TextInput
        mode="outlined"
        placeholder="Phone Number"
        keyboardType="numeric"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSignup}
        style={styles.button}
        buttonColor="#4CAF50"
        loading={loading}
        disabled={loading}
      >
        Sign Up
      </Button>

      <Text style={styles.loginText}>Already have an account?</Text>
      <Link href="/auth" replace style={styles.loginLink}>
        Login Here
      </Link>
    </KeyboardAvoidingView>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
  loginLink: {
    color: "blue",
    textAlign: "center",
    marginTop: 5,
  },
});
