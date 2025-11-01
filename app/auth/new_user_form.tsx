import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Menu } from "react-native-paper";

export default function NewUserForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [college, setCollege] = useState("");

  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showCollegeMenu, setShowCollegeMenu] = useState(false);

  const handleSubmit = () => {
    if (!name || !course || !college) {
      alert("Please fill all fields");
      return;
    }

    console.log({
      name,
      course: course,
      college: college,
    });

    alert("Form submitted successfully!");
    router.push("/user");
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
