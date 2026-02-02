import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Card, IconButton, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const UserHistoryPage = () => {
  const router = useRouter();
  const theme = useTheme() as any;
  
  const { 
    orders, 
    loading, 
    error,
    refreshing, 
    onRefresh, 
    fetchOrders 
  } = useOrders('customer');

  const historyOrders = useMemo(() => {
    return orders
      .filter(o => ['DELIVERED', 'CANCELLED'].includes(o.order_status.toUpperCase()))
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  }, [orders]);

  const statusColors: Record<string, string> = {
    DELIVERED: theme.custom?.success || '#10B981',
    CANCELLED: theme.colors.error,
  };

  const getStatusColor = (status: string) => {
    return statusColors[status.toUpperCase()] || theme.colors.onSurfaceVariant;
  };

  const renderOrder = ({ item, index }: { item: Order, index: number }) => {
    const statusColor = getStatusColor(item.order_status);
    const isCancelled = item.order_status.toUpperCase() === 'CANCELLED';
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()} 
        layout={Layout.springify()}
      >
        <Card 
          style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, opacity: isCancelled ? 0.8 : 1 }]} 
          elevation={0}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.orderHeader}>
              <Text style={[styles.orderId, { color: theme.colors.onSurface }]}>Order #{item.order_id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.order_status}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderSubInfo}>
              <Text style={[styles.priceText, { color: theme.colors.onSurface }]}>₹{item.total_price.toFixed(2)}</Text>
              <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                {new Date(item.order_date).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={historyOrders}
        keyExtractor={(item) => item.order_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
            Order History
          </Text>
        }
        ListHeaderComponentStyle={styles.listHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="history" size={60} iconColor={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No past orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  heading: { 
    fontSize: 22, 
    fontWeight: "900", 
    letterSpacing: -1,
    paddingHorizontal: 16
  },
  card: { 
    marginBottom: 8, 
    borderRadius: 12, 
    borderWidth: 1,
    marginHorizontal: 16
  },
  cardContent: { padding: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: "800" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: 'uppercase' },
  orderSubInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  priceText: { fontSize: 17, fontWeight: "900" },
  dateText: { fontSize: 12, fontWeight: "600", opacity: 0.6 },
  listContent: { paddingBottom: 40, paddingTop: 10 },
  listHeader: { marginBottom: 20, marginTop: 10 },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", fontSize: 17, fontWeight: '600', marginTop: 8 },
});

export default UserHistoryPage;
