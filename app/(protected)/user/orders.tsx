import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const OrdersPage = () => {
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

  const activeOrders = React.useMemo(() => {
    return orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.order_status.toUpperCase()));
  }, [orders]);

  const statusColors: Record<string, string> = {
    PENDING: theme.custom?.warning || '#F59E0B',
    CONFIRMED: theme.colors.primary,
    PREPARING: theme.colors.secondary,
    ON_THE_WAY: theme.custom?.info || '#3B82F6',
    DELIVERED: theme.custom?.success || '#10B981',
    CANCELLED: theme.colors.error,
  };

  const getStatusColor = (status: string) => {
    return statusColors[status.toUpperCase()] || theme.colors.onSurfaceVariant;
  };

  const renderOrder = ({ item, index }: { item: Order, index: number }) => {
    const statusColor = getStatusColor(item.order_status);
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()} 
        layout={Layout.springify()}
      >
        <Card 
          style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]} 
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
                {new Date(item.order_date).toLocaleDateString()} at {new Date(item.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {item.order_otp && item.order_status !== 'DELIVERED' && item.order_status.toUpperCase() !== 'COMPLETED' && item.order_status !== 'CANCELLED' && (
              <View style={[styles.otpContainer, { backgroundColor: theme.colors.primaryContainer + '40', borderColor: theme.colors.primary + '30' }]}>
                <Text style={[styles.otpLabel, { color: theme.colors.onSurfaceVariant }]}>OTP:</Text>
                <Text style={[styles.otpValue, { color: theme.colors.primary }]}>{item.order_otp}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Fetching your orders...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="alert-circle-outline" size={60} iconColor={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchOrders}
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
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.order_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
            My Live Orders
          </Text>
        }
        ListHeaderComponentStyle={styles.listHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="package-variant" size={60} iconColor={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>You haven't placed any orders yet</Text>
            <Button 
              mode="contained-tonal" 
              onPress={() => router.replace('/(protected)/user/stores')}
              style={styles.browseBtn}
              buttonColor={theme.colors.primaryContainer}
              textColor={theme.colors.onPrimaryContainer}
            >
              Order Something Now
            </Button>
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
  otpContainer: { 
    marginTop: 14, 
    padding: 12, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderStyle: 'dashed' 
  },
  otpLabel: { fontSize: 14, fontWeight: '700', marginRight: 8 },
  otpValue: { fontSize: 20, fontWeight: '900', letterSpacing: 4 },
  listContent: { paddingBottom: 40, paddingTop: 10 },
  listHeader: { marginBottom: 20, marginTop: 10 },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  errorText: { marginBottom: 16, textAlign: "center", fontSize: 16 },
  retryButton: { borderRadius: 14 },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", fontSize: 17, fontWeight: '600', marginTop: 8, marginBottom: 24 },
  browseBtn: { borderRadius: 12, paddingHorizontal: 16 },
});

export default OrdersPage;
