import { COMPONENT_STYLES, RADIUS, SPACING, TYPOGRAPHY } from "@/lib/theme";
import { Order } from "@/types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Divider, IconButton, Modal, Text, useTheme } from "react-native-paper";

interface OrderDetailModalProps {
  order: Order | null;
  visible: boolean;
  onDismiss: () => void;
  hideCustomer?: boolean;
  children?: React.ReactNode;
}

export const OrderDetailModal = ({ order, visible, onDismiss, hideCustomer, children }: OrderDetailModalProps) => {
  const theme = useTheme();

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        COMPONENT_STYLES.modalContent,
        { backgroundColor: theme.colors.surface }
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.modalHeader}>
          <Text style={[COMPONENT_STYLES.modalTitle, { color: theme.colors.onSurface }]}>
            Order Details #{order.order_id}
          </Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        {!hideCustomer && (
          <>
            <View style={styles.customerDetailRow}>
              <Avatar.Text
                size={40}
                label={order.customer?.name?.charAt(0) || "C"}
                style={{ backgroundColor: theme.colors.primaryContainer }}
                labelStyle={{ color: theme.colors.primary }}
              />
              <View style={{ marginLeft: SPACING.M }}>
                <Text style={[styles.detailName, { color: theme.colors.onSurface }]}>
                  {order.customer?.name || "Customer"}
                </Text>
                {order.customer?.phone_no && (
                  <Text style={[styles.detailPhone, { color: theme.colors.onSurfaceVariant }]}>
                    +91 {order.customer.phone_no}
                  </Text>
                )}
              </View>
            </View>
            <Divider style={COMPONENT_STYLES.divider} />
          </>
        )}

        <Text style={[COMPONENT_STYLES.sectionTitle, { color: theme.colors.onSurface }]}>Order Items</Text>
        <View style={COMPONENT_STYLES.section}>
          {(order.items || []).map((item, idx) => {
            const itemName = item.item_name || item.menu_item?.name || "Item";
            const price = item.price || item.menu_item?.price || 0;
            return (
              <View key={idx} style={styles.detailItemRow}>
                <Text style={[styles.detailItemText, { color: theme.colors.onSurface }]}>
                  {item.quantity}x {itemName}
                </Text>
                <Text style={[styles.detailItemPrice, { color: theme.colors.onSurfaceVariant }]}>
                  ₹{(item.quantity * price).toFixed(2)}
                </Text>
              </View>
            );
          })}
          <View style={[styles.detailTotalRow, { borderTopColor: theme.colors.outline }]}>
            <Text style={[styles.detailTotalLabel, { color: theme.colors.onSurface }]}>Grand Total</Text>
            <Text style={[styles.detailTotalValue, { color: theme.colors.primary }]}>
              ₹{order.total_price.toFixed(2)}
            </Text>
          </View>
        </View>

        {children && (
          <View style={styles.modalActions}>
            {children}
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    ...COMPONENT_STYLES.rowSpaceBetween,
    marginBottom: SPACING.L,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.L,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: SPACING.M,
    borderRadius: RADIUS.L,
  },
  detailName: {
    ...TYPOGRAPHY.SUBTITLE,
  },
  detailPhone: {
    ...TYPOGRAPHY.BODY_SMALL,
    opacity: 0.7,
  },
  detailItemRow: {
    ...COMPONENT_STYLES.rowSpaceBetween,
    marginBottom: SPACING.M,
  },
  detailItemText: {
    ...TYPOGRAPHY.BODY_BOLD,
    flex: 1,
    paddingRight: SPACING.M,
  },
  detailItemPrice: {
    ...TYPOGRAPHY.BODY_SMALL_BOLD,
  },
  detailTotalRow: {
    ...COMPONENT_STYLES.rowSpaceBetween,
    marginTop: SPACING.L,
    paddingTop: SPACING.L,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  detailTotalLabel: {
    ...TYPOGRAPHY.SUBTITLE,
  },
  detailTotalValue: {
    ...TYPOGRAPHY.H2,
  },
  modalActions: {
    gap: SPACING.M,
  },
});
