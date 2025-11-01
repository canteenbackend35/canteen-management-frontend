import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f9fafb",
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 40,
            color: "#111827",
          }}
        >
          Canteen Management 🍱
        </Text>

        {/* Auth Button */}
        <Link href="/auth" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#2563eb",
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Login / Signup
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Dashboard Button */}
        <Link href="/user" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#10b981",
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Dashboard
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
