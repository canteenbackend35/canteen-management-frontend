import { MultiStepSlider, OrderStatusType } from "@/features/orders/components/MultiStepSlider";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrderActions } from "@/features/orders/hooks/useOrderActions";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { verifyOrderSchema } from "@/lib/validators";
import { Order } from "@/types";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Divider, IconButton, Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const StoreKitchenView = () => {
  const theme = useTheme() as any;
  
  const { 
    orders, 
    loading, 
    refreshing, 
    onRefresh, 
    fetchOrders 
  } = useOrders('store');

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
      .filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.order_status.toUpperCase()))
      .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());
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
          hideCustomer={true}
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
               <Text style={[styles.statBadge, { backgroundColor: theme.colors.primaryContainer, color: theme.colors.primary }]}>
                 {kitchenOrders.length} Pending
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
        {/* Order Details Modal */}
        <Modal
          visible={!!selectedOrder}
          onDismiss={() => setSelectedOrder(null)}
          contentContainerStyle={[
            styles.modalContent, 
            { backgroundColor: theme.colors.surface }
          ]}
        >
          {selectedOrder && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Order Details #{selectedOrder.order_id}</Text>
                <IconButton icon="close" onPress={() => setSelectedOrder(null)} />
              </View>

              <View style={styles.customerDetailRow}>
                <Avatar.Text 
                  size={40} 
                  label={selectedOrder.customer?.name?.charAt(0) || "C"} 
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  labelStyle={{ color: theme.colors.primary }}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.detailName, { color: theme.colors.onSurface }]}>{selectedOrder.customer?.name || "Customer"}</Text>
                  <Text style={[styles.detailPhone, { color: theme.colors.onSurfaceVariant }]}>+91 {selectedOrder.customer?.phone_no}</Text>
                </View>
              </View>

              <Divider style={styles.modalDivider} />

              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Kitchen Ticket</Text>
              <View style={styles.detailItemsList}>
                {(selectedOrder.items || []).map((item: any, idx) => (
                  <View key={idx} style={styles.detailItemRow}>
                    <Text style={[styles.detailItemText, { color: theme.colors.onSurface }]}>
                      {item.quantity}x {item.menu_item?.name || item.name}
                    </Text>
                    <Text style={[styles.detailItemPrice, { color: theme.colors.onSurfaceVariant }]}>
                      ₹{(item.quantity * (item.menu_item?.price || item.price)).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={[styles.detailTotalRow, { borderTopColor: theme.colors.outline }]}>
                  <Text style={[styles.detailTotalLabel, { color: theme.colors.onSurface }]}>Grand Total</Text>
                  <Text style={[styles.detailTotalValue, { color: theme.colors.primary }]}>₹{selectedOrder.total_price.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button 
                  mode="contained" 
                  onPress={() => setSelectedOrder(null)}
                  style={styles.modalActionBtn}
                >
                  Close Details
                </Button>

                <Button 
                  mode="outlined" 
                  onPress={() => handleAction(selectedOrder.order_id, 'CANCEL')}
                  style={[styles.modalCancelBtn, { borderColor: theme.colors.error }]}
                  textColor={theme.colors.error}
                  icon="close-circle-outline"
                >
                  Reject & Cancel Order
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>

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
  headerStats: {},
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
