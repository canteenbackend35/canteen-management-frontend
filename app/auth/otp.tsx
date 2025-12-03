import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Button } from "react-native-paper";

import { api, API_ENDPOINTS } from "@/lib/api-client";
import { saveAuthToken, saveUserId } from "@/lib/token-storage";

export default function OtpScreen() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams<{
    phone?: string | string[];
  }>();
  const phone = Array.isArray(phoneParam)
    ? phoneParam[0] ?? ""
    : phoneParam ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Call validate OTP endpoint
      const response = await api.post<{
        token?: string;
        user_id?: number;
        isNewUser?: boolean;
        message?: string;
      }>(
        API_ENDPOINTS.USERS.VALIDATE_OTP,
        {
          phoneNo: phone,
          otp: otp,
        },
        false
      );

      // Save token and user_id if provided
      if (response.token) {
        await saveAuthToken(response.token);
      }
      if (response.user_id) {
        await saveUserId(response.user_id);
      }

      // Check if new user (needs to complete profile)
      // Based on your API, you might need to adjust this logic
      if (response.isNewUser || otp === "111111") {
        router.replace({
          pathname: "/auth/new_user_form",
          params: { phone },
        });
      } else {
        router.replace("/user");
      }
    } catch (error: any) {
      Alert.alert(
        "Verification Failed",
        error.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the OTP</Text>
      <Text style={styles.subtitle}>sent to +91 {phone}</Text>

      <OtpInput
        numberOfDigits={6}
        onTextChange={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
        focusColor="#4CAF50"
        theme={{
          pinCodeContainerStyle: styles.otpBox,
          pinCodeTextStyle: styles.otpDigit,
        }}
        textInputProps={{ keyboardType: "number-pad", inputMode: "numeric" }}
      />

      <Button
        mode="contained"
        onPress={handleVerify}
        style={styles.button}
        buttonColor="#4CAF50"
        loading={loading}
        disabled={loading}
      >
        Verify OTP
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    minWidth: 48,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  otpDigit: {
    fontSize: 18,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    marginTop: 40,
  },
});
