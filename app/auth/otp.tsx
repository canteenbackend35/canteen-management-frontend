import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Button } from "react-native-paper";

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }

    console.log("Verifying OTP:", otp, "for phone:", phone);

    // simulate success for now
    Alert.alert("Success", "OTP verified successfully");

    // redirect based on OTP value
    if (otp === "111111") {
      router.push("/auth/new_user_form");
    } else {
      router.push("/user");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the OTP</Text>
      <Text style={styles.subtitle}>sent to +91 {phone}</Text>

      <OtpInput
        numberOfDigits={6}
        onTextChange={(text) => setOtp(text)}
        focusColor="#4CAF50"
        theme={{
          pinCodeContainerStyle: styles.otpBox,
        }}
      />

      <Button
        mode="contained"
        onPress={handleVerify}
        style={styles.button}
        buttonColor="#4CAF50"
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
  },
  button: {
    width: "100%",
    marginTop: 40,
  },
});
