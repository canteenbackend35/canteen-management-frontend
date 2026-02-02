import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types";
import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

const StoreHistoryPage = () => {
  const theme = useTheme() as any;
  
  const { 
    orders, 
    loading, 
    refreshing, 
    onRefresh 
  } = useOrders('store');

  const historyOrders = useMemo(() => {
    return orders
      .filter(o => ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.order_status.toUpperCase()))
      .sort((a,b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  }, [orders]);

  const calculateDailyTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return historyOrders
      .filter(o => o.order_date.startsWith(today) && (o.order_status === 'DELIVERED' || o.order_status.toUpperCase() === 'COMPLETED'))
      .reduce((sum, o) => sum + o.total_price, 0);
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isCancelled = item.order_status.toUpperCase() === 'CANCELLED';
    return (
      <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
        <Card.Content style={styles.cardContent}>
          <View>
            <Text style={[styles.orderId, { color: theme.colors.onSurface }]}>Order #{item.order_id}</Text>
            <Text style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(item.order_date).toLocaleDateString()} at {new Date(item.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: isCancelled ? theme.colors.error : theme.colors.primary }]}>
              ₹{item.total_price.toFixed(2)}
            </Text>
            <Text style={[styles.statusLabel, { color: isCancelled ? theme.colors.error : theme.colors.primary }]}>
              {item.order_status}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={historyOrders}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Order History</Text>
              <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>Review your past sales and performance</Text>
            </View>
            
            <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
              <Card.Content>
                <Text style={[styles.summaryLabel, { color: theme.colors.onPrimaryContainer }]}>Today's Total Sales</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.onPrimaryContainer }]}>₹{calculateDailyTotal().toFixed(2)}</Text>
              </Card.Content>
            </Card>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Past Orders</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No history found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subheading: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.7,
  },
  summaryCard: {
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    opacity: 0.6,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.6,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: '900',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
});

export default StoreHistoryPage;
