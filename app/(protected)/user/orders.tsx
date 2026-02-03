import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { Order } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
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

  const renderOrder = ({ item, index }: { item: Order, index: number }) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).springify()} 
        layout={Layout.springify()}
      >
        <OrderCard order={item}>
          {item.order_otp && item.order_status !== 'DELIVERED' && item.order_status.toUpperCase() !== 'COMPLETED' && item.order_status !== 'CANCELLED' && (
            <View style={[styles.otpContainer, { backgroundColor: theme.colors.primaryContainer + '40', borderColor: theme.colors.primary + '30' }]}>
              <Text style={[styles.otpLabel, { color: theme.colors.onSurfaceVariant }]}>OTP:</Text>
              <Text style={[styles.otpValue, { color: theme.colors.primary }]}>{item.order_otp}</Text>
            </View>
          )}
        </OrderCard>
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
  otpContainer: { 
    marginTop: 4, 
    padding: 8, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderStyle: 'dashed' 
  },
  otpLabel: { fontSize: 13, fontWeight: '700', marginRight: 8 },
  otpValue: { fontSize: 18, fontWeight: '900', letterSpacing: 4 },
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
