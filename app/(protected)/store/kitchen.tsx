import { useOrders } from "@/hooks/useOrders";
import { api, API_ENDPOINTS } from "@/lib/api-client";
import { Order } from "@/types";
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Divider, IconButton, Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";
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

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verificationOrder, setVerificationOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const kitchenOrders = useMemo(() => {
    return orders
      .filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY'].includes(o.order_status.toUpperCase()))
      .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());
  }, [orders]);

  const handleAction = async (orderId: number, action: 'COMPLETE' | 'CANCEL' | 'VERIFY', otp?: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      let response;
      if (action === 'VERIFY') {
        setVerifying(true);
        response = await api.post(API_ENDPOINTS.ORDERS.VERIFY(orderId), {
          order_otp: otp
        });
      } else if (action === 'COMPLETE') {
        response = await api.patch(API_ENDPOINTS.ORDERS.COMPLETE(orderId), {});
      } else if (action === 'CANCEL') {
        response = await api.patch(API_ENDPOINTS.ORDERS.CANCEL(orderId), {});
      }

      if (response?.success) {
        fetchOrders();
        setSelectedOrder(null);
        setVerificationOrder(null);
        setOtpInput("");
      } else if (action === 'VERIFY') {
        alert(response?.UImessage || "Verification failed");
      }
    } catch (err: any) {
      console.error(`Failed to ${action} order ${orderId}:`, err);
    } finally {
      setVerifying(false);
    }
  };

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

  const renderCompactOrder = ({ item, index }: { item: Order, index: number }) => {
    const statusColor = getStatusColor(item.order_status);
    const timeAgo = Math.floor((new Date().getTime() - new Date(item.order_date).getTime()) / 60000);
    const isOverdue = timeAgo > 15;
    
    // Create a summary of items: "2x Burger, 1x Coke..."
    const itemsSummary = (item.items || []).map(i => `${i.quantity}x ${i.menu_item?.name || i.item_name || 'Item'}`).join(', ');

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()} 
        layout={Layout.springify()}
      >
        <Card 
          style={[
            styles.compactCard, 
            { 
              backgroundColor: theme.colors.surface, 
              borderColor: isOverdue ? theme.colors.error : theme.colors.outline,
              borderLeftWidth: 5,
              borderLeftColor: statusColor
            }
          ]} 
          elevation={1}
          onPress={() => setSelectedOrder(item)}
        >
          <View style={styles.compactRow}>
            {/* 1. Primary Detail: The Food Items */}
            <View style={styles.mainInfo}>
              <View style={styles.titleRow}>
                 <Text style={[styles.orderIdText, { color: theme.colors.onSurface }]}>#{item.order_id}</Text>
                 <Text style={[styles.timeText, { color: isOverdue ? theme.colors.error : theme.colors.onSurfaceVariant }]}>
                   • {timeAgo}m ago
                 </Text>
              </View>
              <Text style={[styles.itemsSummary, { color: theme.colors.onSurface }]} numberOfLines={2}>
                {itemsSummary}
              </Text>
              <Text style={[styles.customerMini, { color: theme.colors.onSurfaceVariant }]}>
                 {item.customer?.name || "Walk-in"}
              </Text>
            </View>
            
            {/* 2. Secondary/Action: Verification Part */}
            <View style={styles.actionPart}>
              {item.order_status === 'PENDING' ? (
                <View style={styles.otpActionGroup}>
                   <Text style={[styles.actionLabel, { color: theme.colors.primary }]}>VERIFY</Text>
                   <IconButton 
                    icon="shield-key-outline" 
                    mode="contained"
                    containerColor={theme.colors.primaryContainer}
                    iconColor={theme.colors.primary}
                    size={28}
                    onPress={() => setVerificationOrder(item)}
                    style={styles.actionIconBtn}
                  />
                </View>
              ) : (
                <View style={styles.otpActionGroup}>
                   <Text style={[styles.actionLabel, { color: '#10B981' }]}>FINISH</Text>
                   <IconButton 
                    icon="check-bold" 
                    mode="contained"
                    containerColor="#10B98115"
                    iconColor="#10B981"
                    size={28}
                    onPress={() => handleAction(item.order_id, 'COMPLETE')}
                    style={styles.actionIconBtn}
                  />
                </View>
              )}
            </View>
          </View>
        </Card>
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
                {selectedOrder.order_status === 'PENDING' ? (
                  <Button 
                    mode="contained" 
                    onPress={() => {
                      setSelectedOrder(null);
                      setVerificationOrder(selectedOrder);
                    }}
                    style={styles.modalActionBtn}
                    icon="shield-check"
                  >
                    Verify & Handover
                  </Button>
                ) : (
                  <Button 
                    mode="contained" 
                    onPress={() => handleAction(selectedOrder.order_id, 'COMPLETE')}
                    style={[styles.modalActionBtn, { backgroundColor: '#10B981' }]}
                    icon="check-circle"
                  >
                    Mark Delivered
                  </Button>
                )}
                <Button 
                  mode="text" 
                  onPress={() => handleAction(selectedOrder.order_id, 'CANCEL')}
                  style={[styles.modalCancelBtn]}
                  textColor={theme.colors.error}
                >
                  Reject Order
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
                onPress={() => handleAction(verificationOrder.order_id, 'VERIFY', otpInput)}
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
  
  compactCard: { 
    marginBottom: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  compactRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12,
  },
  mainInfo: { flex: 1, paddingRight: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orderIdText: { fontSize: 16, fontWeight: "900" },
  timeText: { fontSize: 12, fontWeight: "700", marginLeft: 4 },
  itemsSummary: { fontSize: 15, fontWeight: "800", lineHeight: 20, marginBottom: 4 },
  customerMini: { fontSize: 11, fontWeight: "600", textTransform: 'uppercase', opacity: 0.6 },

  actionPart: { width: 80, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.05)', paddingLeft: 8 },
  otpActionGroup: { alignItems: 'center' },
  actionLabel: { fontSize: 10, fontWeight: "900", marginBottom: -4, marginTop: 2 },
  actionIconBtn: { margin: 0 },

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
