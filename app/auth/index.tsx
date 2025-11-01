import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function PhoneNumberScreen() {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    if (!/^[0-9]{10}$/.test(phone)) {
      Alert.alert(
        "Invalid number",
        "Please enter a valid 10-digit phone number"
      );
      return;
    }

    // later we’ll send OTP here
    console.log("Phone Number Entered:", phone);

    // navigate to OTP page
    router.push({
      pathname: "/auth/otp",
      params: { phone },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your phone number</Text>

      <View style={styles.phoneContainer}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          mode="outlined"
          placeholder="Enter phone number"
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          maxLength={10}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={styles.button}
        buttonColor="#4CAF50"
      >
        Continue
      </Button>
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
});
