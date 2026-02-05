import { useOrderTracking } from "@/features/orders/hooks/useOrderTracking";
import { orderService } from "@/features/orders/services/orderService";
import { Order } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import {
    Avatar,
    Button,
    Card,
    Divider,
    IconButton,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import Animated, { FadeInUp, SlideInRight } from "react-native-reanimated";

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial order data
  const fetchInitialData = async () => {
    try {
      const data = await orderService.getOrderDetails(id as string);
      setOrder(data.order);
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // SSE Real-time Hook
  const { status: liveStatus, isConnected, logs } = useOrderTracking(
    id as string,
    order?.order_status || 'PENDING'
  );

  const currentStatus = liveStatus || order?.order_status || 'PENDING';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Order not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={1}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSubtitle}>#{id}</Text>
        </View>
        
        {/* Animated Live Indicator */}
        <View style={styles.liveBadgeWrapper}>
          <View style={[
            styles.liveDot, 
            { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' }
          ]} />
          <Text style={[
            styles.liveText, 
            { color: isConnected ? '#4CAF50' : '#FF9800' }
          ]}>
            {isConnected ? 'LIVE' : 'RECONNECTING...'}
          </Text>
        </View>
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Live Status Card */}
        <Animated.View entering={FadeInUp}>
          <Card style={styles.mainCard}>
            <Card.Content>
              <View style={styles.statusHero}>
                <Avatar.Icon 
                  size={64} 
                  icon={currentStatus === 'CANCELLED' ? 'close-circle' : 'food'} 
                  style={{ backgroundColor: currentStatus === 'CANCELLED' ? theme.colors.error : theme.colors.primary }}
                />
                <Text style={[styles.heroText, { color: theme.colors.onSurface }]}>
                  {currentStatus}
                </Text>
                <Text style={styles.heroDesc}>
                  Your order is currently in {currentStatus.toLowerCase()} state.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Order Info */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Card style={styles.infoCard}>
            <Card.Title title="Order Summary" titleStyle={styles.cardTitle} />
            <Divider />
            <Card.Content style={styles.itemContent}>
              {(order.items || []).map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.quantity}x {item.item_name || item.menu_item?.name}</Text>
                  <Text style={styles.itemPrice}>₹{(item.quantity * item.price).toFixed(2)}</Text>
                </View>
              ))}
              <Divider style={styles.itemDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>₹{order.total_price.toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {order.order_otp && currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && (
          <Animated.View entering={SlideInRight.delay(400)}>
            <Surface style={[styles.otpSurface, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
              <Text style={[styles.otpLabel, { color: theme.colors.onPrimaryContainer }]}>Pickup OTP</Text>
              <Text style={[styles.otpValue, { color: theme.colors.onPrimaryContainer }]}>{order.order_otp}</Text>
              <Text style={[styles.otpDesc, { color: theme.colors.onPrimaryContainer }]}>Show this at the counter to collect your order</Text>
            </Surface>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, opacity: 0.6, fontWeight: '700' },
  liveBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: { padding: 20, paddingBottom: 60 },
  mainCard: { borderRadius: 24, marginBottom: 20, elevation: 0, backgroundColor: 'rgba(99, 102, 241, 0.05)' },
  statusHero: { alignItems: 'center', marginVertical: 20 },
  heroText: { fontSize: 24, fontWeight: '900', marginTop: 16, letterSpacing: -1 },
  heroDesc: { fontSize: 14, opacity: 0.6, textAlign: 'center', marginTop: 4, fontWeight: '500' },
  infoCard: { borderRadius: 24, marginBottom: 20, elevation: 0 },
  cardTitle: { fontWeight: '900', fontSize: 18 },
  itemContent: { paddingTop: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemName: { fontSize: 15, fontWeight: '600', opacity: 0.8 },
  itemPrice: { fontSize: 15, fontWeight: '700' },
  itemDivider: { marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  otpSurface: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  otpLabel: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 },
  otpValue: { fontSize: 36, fontWeight: '900', letterSpacing: 10, marginVertical: 8 },
  otpDesc: { fontSize: 12, fontWeight: '600', opacity: 0.7, textAlign: 'center' },
  debugSection: {
    marginTop: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  debugLogText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#444',
    marginBottom: 4,
  },
});
