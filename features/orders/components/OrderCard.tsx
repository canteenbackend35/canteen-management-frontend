import { StatusBadge } from '@/components/common/StatusBadge';
import { SPACING, TYPOGRAPHY } from '@/lib/theme';
import { Order } from '@/types';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  children?: React.ReactNode; // Slot for actions (Sliders/Buttons)
  style?: ViewStyle;
  showAbsoluteTime?: boolean;
  hideCustomer?: boolean;
}

/**
 * Core Domain Component for Order representation.
 * Standardizes the look and feel across the app while allowing flexible actions.
 */
export const OrderCard = ({ order, onPress, children, style, showAbsoluteTime, hideCustomer }: OrderCardProps) => {
  const theme = useTheme();
  
  const timeAgo = useMemo(() => {
    return Math.floor((new Date().getTime() - new Date(order.order_date).getTime()) / 60000);
  }, [order.order_date]);

  const absoluteTime = useMemo(() => {
    const d = new Date(order.order_date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [order.order_date]);

  const itemsSummary = useMemo(() => {
    return (order.items || []).map(i => 
      `${i.quantity}x ${i.menu_item?.name || i.item_name || 'Item'}`
    ).join(', ');
  }, [order.items]);

  const isOverdue = !showAbsoluteTime && timeAgo > 15;

  return (
    <Card 
      style={[
        styles.card, 
        { borderColor: isOverdue ? theme.colors.error : theme.colors.outline },
        style
      ]} 
      elevation={1}
    >
      <Pressable 
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.topSection,
          { opacity: pressed ? 0.7 : 1 }
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.orderId, { color: theme.colors.onSurface }]}>#{order.order_id}</Text>
          <Text style={[styles.timeText, { color: isOverdue ? theme.colors.error : theme.colors.onSurfaceVariant }]}>
            • {absoluteTime} {showAbsoluteTime ? '' : `(${timeAgo}m ago)`}
          </Text>
          <StatusBadge status={order.order_status} style={styles.statusBadge} />
        </View>

        <Text style={[styles.summary, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {itemsSummary}
        </Text>

        <View style={styles.bottomRow}>
          {!hideCustomer && (
            <Text style={[styles.customer, { color: theme.colors.onSurfaceVariant }]}>
              {order.customer?.name || "Walk-in"}
            </Text>
          )}
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ₹{order.total_price}
          </Text>
        </View>
      </Pressable>

      {children && (
        <View style={styles.actionSection}>
          {children}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.L,
    marginBottom: SPACING.M,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  topSection: {
    padding: SPACING.M,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.S 
  },
  orderId: {
    fontSize: TYPOGRAPHY.H2.fontSize,
    fontWeight: TYPOGRAPHY.H2.fontWeight,
    letterSpacing: TYPOGRAPHY.H2.letterSpacing,
  },
  timeText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  statusBadge: { marginLeft: 'auto' },
  summary: { 
    fontSize: TYPOGRAPHY.BODY_BOLD.fontSize,
    fontWeight: TYPOGRAPHY.BODY_BOLD.fontWeight,
    lineHeight: 20, 
    marginBottom: SPACING.S 
  },
  bottomRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  customer: {
    fontSize: TYPOGRAPHY.CAPTION.fontSize,
    fontWeight: TYPOGRAPHY.CAPTION.fontWeight,
    textTransform: TYPOGRAPHY.CAPTION.textTransform,
    letterSpacing: TYPOGRAPHY.CAPTION.letterSpacing,
  },
  price: { 
    fontSize: 16,
    fontWeight: TYPOGRAPHY.BODY_BOLD.fontWeight,
  },
  actionSection: {
    paddingHorizontal: SPACING.M,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
});
