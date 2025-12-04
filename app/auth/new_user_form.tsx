import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Menu } from "react-native-paper";

import { api, API_ENDPOINTS } from "@/lib/api-client";

export default function NewUserForm() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams<{
    phone?: string | string[];
  }>();
  const phone = Array.isArray(phoneParam)
    ? phoneParam[0] ?? ""
    : phoneParam ?? "";

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showCollegeMenu, setShowCollegeMenu] = useState(false);

  const handleSubmit = async () => {
    if (!name || !course || !college) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    if (!phone) {
      Alert.alert("Error", "Phone number is missing. Please go back and try again.");
      return;
    }

    setLoading(true);
    try {
      // Call signup endpoint
      await api.post(
        API_ENDPOINTS.USERS.SIGNUP,
        {
          name,
          phone_no: phone,
          course,
          college,
        },
        false
      );

      Alert.alert("Success", "Profile completed successfully!");
      router.replace("/user");
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Failed to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* Course Dropdown */}
      <Menu
        visible={showCourseMenu}
        onDismiss={() => setShowCourseMenu(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setShowCourseMenu(true)}
            style={styles.dropdownButton}
          >
            {course ? course : "Select Course"}
          </Button>
        }
      >
        {["B.Tech", "BCA", "MCA", "MBA", "Other"].map((item) => (
          <Menu.Item
            key={item}
            onPress={() => {
              setCourse(item);
              setShowCourseMenu(false);
            }}
            title={item}
          />
        ))}
      </Menu>

      {/* College Dropdown */}
      <Menu
        visible={showCollegeMenu}
        onDismiss={() => setShowCollegeMenu(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setShowCollegeMenu(true)}
            style={styles.dropdownButton}
          >
            {college ? college : "Select College"}
          </Button>
        }
      >
        {["IIT Delhi", "NIT Trichy", "DTU", "Other"].map((item) => (
          <Menu.Item
            key={item}
            onPress={() => {
              setCollege(item);
              setShowCollegeMenu(false);
            }}
            title={item}
          />
        ))}
      </Menu>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        buttonColor="#4CAF50"
        loading={loading}
        disabled={loading}
      >
        Submit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  dropdownButton: {
    borderColor: "#ccc",
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 40,
  },
});
