import { useOrderTracking } from "@/features/orders/hooks/useOrderTracking";
import { Order } from "@/types";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { OrderCard } from "./OrderCard";

interface LiveOrderCardProps {
  order: Order;
  onStatusChange?: (newStatus: string) => void;
  onPress?: () => void;
}

/**
 * A "Smart" version of OrderCard that connects to SSE
 * to update itself in real-time on the main Orders list.
 */
export const LiveOrderCard = ({ order, onStatusChange, onPress }: LiveOrderCardProps) => {
  const theme = useTheme();
  
  // Connect to SSE for this specific order
  const { status: liveStatus, isConnected } = useOrderTracking(
    order.order_id,
    order.order_status
  );

  // Notify parent if status changes (e.g., to move it out of 'Live' section)
  useEffect(() => {
    if (liveStatus && liveStatus !== order.order_status) {
      onStatusChange?.(liveStatus);
    }
  }, [liveStatus]);

  // Merge live status into the order object for display
  const smartOrder = {
    ...order,
    order_status: liveStatus || order.order_status
  };

  return (
    <View>
      <OrderCard 
        order={smartOrder} 
        showPrice={true} 
        hideCustomer={true}
        onPress={onPress}
      >
        {/* Real-time Indicator inside the card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          {smartOrder.order_otp && smartOrder.order_status !== 'DELIVERED' && smartOrder.order_status !== 'CANCELLED' && (
            <View style={{ 
              backgroundColor: theme.colors.primaryContainer + '40', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6,
              borderWidth: 1,
              borderColor: theme.colors.primary + '20',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', marginRight: 8, opacity: 0.7 }}>OTP:</Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: theme.colors.primary, letterSpacing: 1 }}>{smartOrder.order_otp}</Text>
            </View>
          )}
          
          {isConnected && (
            <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 4 }} />
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#4CAF50', opacity: 0.8 }}>LIVE</Text>
            </View>
          )}
        </View>
      </OrderCard>
    </View>
  );
};
