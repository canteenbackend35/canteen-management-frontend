import { api, API_ENDPOINTS } from "@/lib/api-client";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Appbar, BottomNavigation, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import StoreHistoryPage from "./history";
import StoreKitchenView from "./kitchen";
import StoreMenuPage from "./menu";
import StoreProfilePage from "./profile";

const StoreLayout = () => {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  React.useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        const isStore = response.role === 'store' || (response.user && response.user.store_id);

        if (!isStore) {
          router.replace("/(protected)/user/stores");
        } else {
          setChecking(false);
        }
      } catch {
        router.replace("/auth");
      }
    };
    checkRole();
  }, []);

  const [routes] = useState([
    { key: "orders", title: "Orders", icon: "clipboard-list" },
    { key: "menu", title: "Menu", icon: "food-fork-drink" },
    { key: "history", title: "History", icon: "history" },
    { key: "profile", title: "Profile", icon: "store-cog" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    orders: StoreKitchenView,
    menu: StoreMenuPage,
    history: StoreHistoryPage,
    profile: StoreProfilePage,
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

  if (checking) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const handleLogout = () => {
    router.replace("/auth");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, height: 56, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }} elevated={false}>
        <Appbar.Content title="Store Panel" titleStyle={[styles.logo, { color: theme.colors.primary }]} />
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
        activeIndicatorStyle={{ backgroundColor: theme.colors.primaryContainer }}
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
    fontSize: 22,
    letterSpacing: -1,
  },
  bar: {
    height: 75,
    borderTopWidth: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StoreLayout;
