import { CartBar } from "@/components/CartBar";
import { api, API_ENDPOINTS } from "@/lib/api-client";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

type Store = {
  store_id: number;
  store_name: string;
  status?: string;
  phone_no?: string;
  payment_details?: string;
};

export default function StoreListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<Store[]>(API_ENDPOINTS.STORES.LIST, false);

      setStores(data);
    } catch (err: any) {
      setError(err.message || "Failed to load stores");
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (storeId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/store/${storeId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading stores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchStores}
          style={styles.retryButton}
          buttonColor={theme.colors.primary}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.onSurface }]}>Available Stores</Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.store_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.store_id)} activeOpacity={0.7}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]} elevation={1}>
              <Card.Content>
                <Text style={[styles.storeName, { color: theme.colors.onSurface }]}>{item.store_name}</Text>
                {item.status && (
                  <Text style={[styles.storeDesc, { color: theme.colors.onSurfaceVariant }]}>Status: {item.status}</Text>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No stores available</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Industrial Floating Cart - Persistent across dashboard */}
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  storeName: {
    fontSize: 19,
    fontWeight: "800",
  },
  storeDesc: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    borderRadius: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 17,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 120, // Critical: Space for floating CartBar
  }
});

