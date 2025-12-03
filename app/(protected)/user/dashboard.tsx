import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { api, API_ENDPOINTS } from "@/lib/api-client";

type Store = {
  store_id: number;
  store_name: string;
  status?: string;
  phone_no?: string;
  payment_details?: string;
};

export default function StoreListScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
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
    router.push(`/user/store/${storeId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchStores}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Stores</Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.store_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.store_id)}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.storeName}>{item.store_name}</Text>
                {item.status && (
                  <Text style={styles.storeDesc}>Status: {item.status}</Text>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No stores available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  storeDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 32,
  },
});
