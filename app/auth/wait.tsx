import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MagicLinkSentScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Magic Link Sent ✨</Text>
        <Text style={styles.subtitle}>
          Please check your email for your sign-in link. It may take a few
          seconds to arrive.
        </Text>

        {/* <ActivityIndicator size="large" color="#fff" style={styles.loader} /> */}

        <Text style={styles.smallText}>
          Didn’t receive it? Check your spam folder.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4f46e5", // violet gradient start
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 30,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  loader: {
    marginBottom: 25,
  },
  smallText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textAlign: "center",
  },
});
