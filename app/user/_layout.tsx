import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Import icons
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { BottomNavigation } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Import your pages
import StoresPage from "./index"; // Adjust path if needed
import LiveOrdersPage from "./liveOrder"; // Adjust path if needed

const UserLayout = () => {
  const [index, setIndex] = useState(0);

  // Define routes for BottomNavigation
  const [routes] = useState([
    { key: "stores", title: "Stores", icon: "store" },
    { key: "liveOrders", title: "Live Orders", icon: "clipboard-list" },
  ]);

  // Map routes to screens
  const renderScene = BottomNavigation.SceneMap({
    stores: StoresPage,
    liveOrders: LiveOrdersPage,
  });

  // ✅ Use custom icon renderer so icons always show
  const renderIcon = ({ route, focused, color }) => {
    const iconName = route.icon;
    return (
      <MaterialCommunityIcons
        name={iconName}
        size={focused ? 26 : 24}
        color={color}
        style={{ marginBottom: -2 }} // subtle alignment fix
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderIcon={renderIcon} // ✅ custom icon renderer
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
    height: 70, // ✅ better visual balance (was 60)
    paddingBottom: 5, // ✅ fixes bottom spacing issue
    elevation: 8, // ✅ adds shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default UserLayout;
