import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { api, API_ENDPOINTS } from "@/lib/api-client";

type Order = {
  order_id: number;
  customer_id: number;
  store_id: number;
  total_price: number;
  payment_id?: string;
  order_status: string;
  order_date: string;
};

const LiveOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    console.log("Orders fetched");
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetched orders:");
      const data = await api.get<Order[]>(API_ENDPOINTS.USERS.ORDERS);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <Text variant="titleMedium">Order #{item.order_id}</Text>
        <Text>Status: {item.order_status}</Text>
        <Text>Total: ₹{item.total_price}</Text>
        <Text style={styles.dateText}>
          {new Date(item.order_date).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchOrders}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text variant="headlineMedium" style={styles.heading}>
            My Orders
          </Text>
        }
        ListHeaderComponentStyle={styles.listHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
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

export default LiveOrdersPage;
