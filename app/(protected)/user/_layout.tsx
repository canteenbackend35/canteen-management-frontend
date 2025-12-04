import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { BottomNavigation } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import StoresPage from "./dashboard";
import LiveOrdersPage from "./liveOrder";

const UserLayout = () => {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut(); // 1️⃣ logout from supabase
    router.replace("/auth"); // 3️⃣ redirect to login
  };

  const [routes] = useState([
    { key: "stores", title: "Stores", icon: "store" },
    { key: "liveOrders", title: "Live Orders", icon: "clipboard-list" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    stores: StoresPage,
    liveOrders: LiveOrdersPage,
  });

  const renderIcon = ({ route, focused, color }) => {
    return (
      <MaterialCommunityIcons
        name={route.icon}
        size={focused ? 26 : 24}
        color={color}
        style={{ marginBottom: -2 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ⭐ TEMP LOGOUT BUTTON */}
      <View style={{ padding: 10 }}>
        <Button title="Logout" color="#d9534f" onPress={handleLogout} />
        <Button title="Wait Page" onPress={() => router.push("/auth/wait")} />
      </View>

      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderIcon={renderIcon}
        labeled={true}
        shifting={false}
        sceneAnimationEnabled={false}
        barStyle={styles.bar}
        activeColor="#007AFF"
        inactiveColor="#999"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  bar: {
    backgroundColor: "#fff",
    height: 70,
    paddingBottom: 5,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default UserLayout;
