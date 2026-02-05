// app/(protected)/user/store/_layout.tsx
import { Slot, useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function StoreLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Child routes render here (e.g. [storeid].tsx) */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: Platform.OS === "android" ? 1 : 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  rightSpacer: {
    width: 36, // same width as backBtn so title is centered
  },
  content: {
    flex: 1,
  },
});
