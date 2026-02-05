import { api, API_ENDPOINTS } from "@/lib/api-client";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { BottomNavigation, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import HistoryPage from "./history";
import OrdersPage from "./orders";
import UserProfilePage from "./profile";
import StoresPage from "./stores";

const UserLayout = () => {
  const [index, setIndex] = useState(0);
  const theme = useTheme();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  React.useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        const isStore = response.role === 'store' || (response.user && response.user.store_id);

        if (isStore) {
          router.replace("/(protected)/store/kitchen");
        } else {
          setChecking(false);
        }
      } catch {
        router.replace("/auth");
      }
    };
    checkRole();
  }, []);

  const { tab } = useLocalSearchParams();

  React.useEffect(() => {
    if (tab === 'orders' || tab === 'liveOrders') setIndex(1);
    else if (tab === 'history') setIndex(2);
    else if (tab === 'profile') setIndex(3);
    else if (tab === 'stores') setIndex(0);
  }, [tab]);

  const [routes] = useState([
    { key: "stores", title: "Stores", icon: "store" },
    { key: "liveOrders", title: "Orders", icon: "clipboard-list" },
    { key: "history", title: "History", icon: "history" },
    { key: "profile", title: "Profile", icon: "account-settings" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    stores: StoresPage,
    liveOrders: OrdersPage,
    history: HistoryPage,
    profile: UserProfilePage,
  });

  if (checking) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }



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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
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

export default UserLayout;
