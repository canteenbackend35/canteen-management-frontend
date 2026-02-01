import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Appbar, BottomNavigation, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import StoresPage from "./dashboard";
import LiveOrdersPage from "./liveOrder";

const UserLayout = () => {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Assuming a logout endpoint or just clearing local session
      // For now, redirect to auth
      router.replace("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const [routes] = useState([
    { key: "stores", title: "Stores", icon: "store" },
    { key: "liveOrders", title: "Orders", icon: "clipboard-list" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    stores: StoresPage,
    liveOrders: LiveOrdersPage,
  });

  const renderIcon = ({
    route,
    focused,
    color,
  }: {
    route: { icon: string };
    focused: boolean;
    color: string;
  }) => {
    return (
      <MaterialCommunityIcons
        name={route.icon as any}
        size={24}
        color={color}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }} elevated={false}>
        <Appbar.Content title="Canteen" titleStyle={[styles.logo, { color: theme.colors.primary }]} />
        <Appbar.Action icon="logout" onPress={handleLogout} iconColor={theme.colors.onSurfaceVariant} />
      </Appbar.Header>

      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderIcon={renderIcon}
        labeled={true}
        shifting={false}
        sceneAnimationEnabled={true}
        barStyle={[styles.bar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.onSurfaceVariant}
        activeIndicatorStyle={{ backgroundColor: theme.colors.secondaryContainer }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    fontWeight: "900",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  bar: {
    height: 70,
    borderTopWidth: 0.5,
  },
});

export default UserLayout;
