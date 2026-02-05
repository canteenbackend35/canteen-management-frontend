import { LiveOrderCard } from "@/features/orders/components/LiveOrderCard";
import { OrderDetailModal } from "@/features/orders/components/OrderDetailModal";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { COMPONENT_STYLES, RADIUS, SPACING, TYPOGRAPHY } from "@/lib/theme";
import { Order } from "@/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button, IconButton, Portal, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const OrdersPage = () => {
  const router = useRouter();
  const theme = useTheme() as any;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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

  const renderOrder = ({ item, index }: { item: Order, index: number }) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()} 
        layout={Layout.springify()}
      >
        <LiveOrderCard 
          order={item} 
          onStatusChange={(status: string) => {
            if (status === 'DELIVERED' || status === 'CANCELLED') {
              // Refresh the whole list if an order is finished 
              // so it moves to history naturally
              onRefresh();
            }
          }}
          onPress={() => setSelectedOrder(item)}
        />
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[COMPONENT_STYLES.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Fetching your orders...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[COMPONENT_STYLES.centerContainer, { backgroundColor: theme.colors.background }]}>
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
    <View style={[COMPONENT_STYLES.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.order_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        renderItem={renderOrder}
        contentContainerStyle={COMPONENT_STYLES.listContent}
        ListHeaderComponent={
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
            My Live Orders
          </Text>
        }
        ListHeaderComponentStyle={COMPONENT_STYLES.listHeader}
        ListEmptyComponent={
          <View style={COMPONENT_STYLES.emptyContainer}>
            <IconButton icon="package-variant" size={60} iconColor={theme.colors.outline} />
            <Text style={[COMPONENT_STYLES.emptyText, { color: theme.colors.onSurfaceVariant }]}>You haven't placed any orders yet</Text>
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
      <Portal>
        <OrderDetailModal
          order={selectedOrder}
          visible={!!selectedOrder}
          hideCustomer={true}
          onDismiss={() => setSelectedOrder(null)}
        >

        </OrderDetailModal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { 
    ...TYPOGRAPHY.H1,
  },
  loadingText: { 
    ...TYPOGRAPHY.SUBTITLE, 
    marginTop: SPACING.M,
  },
  errorText: { 
    ...TYPOGRAPHY.SUBTITLE, 
    marginBottom: SPACING.L, 
    textAlign: "center",
  },
  retryButton: { 
    borderRadius: RADIUS.L,
  },
  browseBtn: { 
    borderRadius: RADIUS.M, 
    paddingHorizontal: SPACING.L,
  },
  trackButton: {
    borderRadius: RADIUS.L,
    marginTop: SPACING.M,
  },
});

export default OrdersPage;
