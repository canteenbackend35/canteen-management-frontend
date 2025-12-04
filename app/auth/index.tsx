import { API_ENDPOINTS, api } from "@/lib/api-client";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function EmailScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleContinue = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      // Call login endpoint to send OTP
      console.log(email);
      await api.post(API_ENDPOINTS.USERS.LOGIN, { email }, false);

      // Navigate to OTP page
      router.push({
        pathname: "/auth/wait",
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your email</Text>

      <View style={styles.phoneContainer}>
        <TextInput
          mode="outlined"
          placeholder="Enter email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={styles.button}
        buttonColor="#4CAF50"
        loading={loading}
        disabled={loading}
      >
        Continue
      </Button>
      <Text style={styles.signupBlock}>Don&apos;t have an account? </Text>
      <Link style={styles.signupText} href="/auth/signup" replace>
        Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  prefix: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  button: {
    width: "100%",
    paddingVertical: 5,
  },
  signupBlock: {
    marginTop: 20,
    fontSize: 16,

    color: "#666",
  },
  signupText: {
    color: "blue",
  },
});
