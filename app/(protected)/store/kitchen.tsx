import { MultiStepSlider, OrderStatusType } from "@/features/orders/components/MultiStepSlider";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { OrderDetailModal } from "@/features/orders/components/OrderDetailModal";
import { useOrderActions } from "@/features/orders/hooks/useOrderActions";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useStoreWatch } from "@/features/store/hooks/useStoreWatch";
import { verifyOrderSchema } from "@/lib/validators";
import { Order } from "@/types";
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button, IconButton, Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const StoreKitchenView = () => {
  const theme = useTheme() as any;
  
  const { 
    orders, 
    setOrders,
    loading, 
    refreshing, 
    onRefresh, 
    fetchOrders 
  } = useOrders('store');

  const onNewOrder = useCallback((order: Order) => {
    console.log("🔥 onNewOrder triggered in UI:", order.order_id);
    
    // 🔔 Alert the user
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn("Haptics failed", e);
    }
    
    // 🆕 Add to list if not already there
    setOrders((prev: Order[]) => {
      const exists = prev.some((o: Order) => o.order_id === order.order_id);
      if (exists) return prev;
      return [order, ...prev];
    });
  }, [setOrders]);

  const onOrderUpdate = useCallback((data: { order_id: number, order_status: string }) => {
    console.log("🔥 onOrderUpdate triggered in UI:", data.order_id, data.order_status);
    setOrders((prev: Order[]) => {
      return prev.map((o: Order) => 
        o.order_id === data.order_id 
          ? { ...o, order_status: data.order_status as any } 
          : o
      );
    });
  }, [setOrders]);

  const { isConnected: sseConnected } = useStoreWatch(onNewOrder, onOrderUpdate);

  useEffect(() => {
    console.log("📡 SSE Connection Status:", sseConnected ? "CONNECTED" : "DISCONNECTED");
  }, [sseConnected]);

  const { handleAction, isProcessing } = useOrderActions(() => {
    fetchOrders();
    setSelectedOrder(null);
    setVerificationOrder(null);
    setOtpInput("");
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verificationOrder, setVerificationOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const kitchenOrders = useMemo(() => {
    return orders
      .filter((o: Order) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.order_status.toUpperCase()))
      .sort((a: Order, b: Order) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  }, [orders]);

  async function onVerifyOtp() {
    if (!verificationOrder) return;
    try {
      // Validate with Zod
      const validation = verifyOrderSchema.safeParse({ order_otp: otpInput });
      if (!validation.success) {
        alert(validation.error.issues[0].message);
        return;
      }

      setVerifying(true);
      await handleAction(verificationOrder.order_id, 'VERIFY', otpInput);
    } catch (err) {
      console.error("Verification error:", err);
      // Error handled by hook
    } finally {
      setVerifying(false);
    }
  }

  const renderCompactOrder = ({ item, index }: { item: Order, index: number }) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()} 
        layout={Layout.springify()}
      >
        <OrderCard 
          order={item} 
          onPress={() => setSelectedOrder(item)}
          hideCustomer={false}
        >
          {item.order_status.toUpperCase() === 'PENDING' ? (
            <View style={styles.pendingActionRow}>
              <Button 
                mode="outlined" 
                onPress={() => handleAction(item.order_id, 'CANCEL')}
                loading={isProcessing === item.order_id}
                disabled={isProcessing !== null}
                style={[styles.actionBtn, { borderColor: theme.colors.error }]}
                textColor={theme.colors.error}
                contentStyle={{ height: 36 }}
                labelStyle={{ fontSize: 11, fontWeight: '900' }}
              >
                REJECT
              </Button>
              <Button 
                mode="contained" 
                onPress={() => handleAction(item.order_id, 'CONFIRM')}
                loading={isProcessing === item.order_id}
                disabled={isProcessing !== null}
                style={styles.actionBtn}
                contentStyle={{ height: 36 }}
                labelStyle={{ fontSize: 11, fontWeight: '900' }}
              >
                ACCEPT
              </Button>
            </View>
          ) : (
            <MultiStepSlider 
              compact
              currentStatus={item.order_status as OrderStatusType}
              onStatusChange={(newStatus) => {
                if (newStatus === 'DELIVERED') {
                  setVerificationOrder(item);
                } else if (newStatus !== item.order_status) {
                  handleAction(item.order_id, newStatus);
                }
              }}
            />
          )}
        </OrderCard>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={kitchenOrders}
        keyExtractor={(item) => item.order_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        renderItem={renderCompactOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Active Kitchen</Text>
            <View style={styles.headerStats}>
               <View style={styles.liveIndicator}>
                 <View style={[styles.liveDot, { backgroundColor: sseConnected ? '#4CAF50' : '#FF5252' }]} />
                 <Text style={[styles.liveText, { color: sseConnected ? '#4CAF50' : '#FF5252' }]}>
                   {sseConnected ? "LIVE" : "OFFLINE"}
                 </Text>
               </View>
               <Text style={[styles.statBadge, { backgroundColor: theme.colors.primaryContainer, color: theme.colors.primary }]}>
                 {kitchenOrders.length} New
               </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="chef-hat" size={60} iconColor={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Kitchen is clear!</Text>
          </View>
        }
      />

      <Portal>
        <OrderDetailModal
          visible={!!selectedOrder}
          order={selectedOrder}
          onDismiss={() => setSelectedOrder(null)}
        >
          {selectedOrder && (
            <>
              <Button 
                mode="contained" 
                onPress={() => setSelectedOrder(null)}
                style={styles.modalActionBtn}
              >
                Done
              </Button>

              <Button 
                mode="outlined" 
                onPress={() => handleAction(selectedOrder.order_id, 'CANCEL')}
                loading={isProcessing === selectedOrder.order_id}
                disabled={isProcessing !== null}
                style={[styles.modalCancelBtn, { borderColor: theme.colors.error }]}
                textColor={theme.colors.error}
                icon="close-circle-outline"
              >
                Reject & Cancel Order
              </Button>
            </>
          )}
        </OrderDetailModal>

        {/* Verification Modal */}
        <Modal
          visible={!!verificationOrder}
          onDismiss={() => { if (!verifying) setVerificationOrder(null); }}
          contentContainerStyle={[styles.otpModalContent, { backgroundColor: theme.colors.surface }]}
        >
          {verificationOrder && (
            <View style={{ width: '100%' }}>
              <Text style={[styles.otpModalTitle, { color: theme.colors.onSurface }]}>Order Collection</Text>
              <Text style={[styles.otpModalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Ask customer for the 4-digit code for Order #{verificationOrder.order_id}
              </Text>

              <TextInput
                mode="flat"
                placeholder="4-Digit OTP"
                value={otpInput}
                onChangeText={setOtpInput}
                keyboardType="numeric"
                maxLength={4}
                style={[styles.otpInput, { backgroundColor: theme.colors.surfaceVariant + '40' }]}
                underlineColor="transparent"
                activeUnderlineColor={theme.colors.primary}
                autoFocus
                contentStyle={{ fontWeight: '900', textAlign: 'center', fontSize: 24, letterSpacing: 12 }}
              />

              <Button 
                mode="contained" 
                onPress={onVerifyOtp}
                loading={verifying}
                disabled={otpInput.length < 4 || verifying}
                style={styles.otpVerifyBtn}
                contentStyle={{ height: 50 }}
              >
                Verify & Release
              </Button>
              
              <Button 
                mode="text" 
                onPress={() => { setVerificationOrder(null); setOtpInput(""); }}
                disabled={verifying}
                textColor={theme.colors.onSurfaceVariant}
              >
                Cancel
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: { marginBottom: 16, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  heading: { fontSize: 22, fontWeight: "900", letterSpacing: -1 },
  headerStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '800' },
  
  pendingActionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
  },

  listContent: { paddingBottom: 60, paddingTop: 10 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { fontSize: 17, fontWeight: '700', marginTop: 10 },

  modalContent: { 
    margin: 20, 
    padding: 20, 
    borderRadius: 24, 
    maxHeight: '85%',
    maxWidth: 500,
    alignSelf: 'center',
    width: '95%'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  customerDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailName: { fontSize: 16, fontWeight: '700' },
  detailPhone: { fontSize: 13, fontWeight: '500' },
  modalDivider: { marginVertical: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', opacity: 0.6 },
  detailItemsList: { marginBottom: 20 },
  detailItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailItemText: { fontSize: 15, fontWeight: '700', flex: 1 },
  detailItemPrice: { fontSize: 14, fontWeight: '500' },
  detailTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  detailTotalValue: { fontSize: 20, fontWeight: '900' },
  detailTotalLabel: { fontSize: 16, fontWeight: '700' },
  modalActions: { gap: 10 },
  modalActionBtn: { borderRadius: 14, paddingVertical: 4 },
  modalCancelBtn: { borderRadius: 14 },

  otpModalContent: { 
    margin: 30, 
    padding: 24, 
    borderRadius: 28, 
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '90%'
  },
  otpModalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  otpModalSubtitle: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 24, opacity: 0.7 },
  otpInput: { width: '100%', marginBottom: 24, borderRadius: 12 },
  otpVerifyBtn: { width: '100%', borderRadius: 16, marginBottom: 4 },
});

export default StoreKitchenView;
