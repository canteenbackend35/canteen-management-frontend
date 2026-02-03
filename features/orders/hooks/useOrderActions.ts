import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert } from 'react-native';
import { orderService } from '../services/orderService';

/**
 * Feature Hook: Handles order state transitions (Accept, Prepare, Ready, etc.)
 * Centralizes Haptics, Alerts, and Service calls for order actions.
 */
export const useOrderActions = (onSuccess?: () => void) => {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const handleAction = async (orderId: number, action: string, otp?: string) => {
    try {
      setIsProcessing(orderId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await orderService.updateStatus(orderId, action, otp);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();
      } else {
        throw new Error(response.UImessage || `Failed to ${action} order`);
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error(`Order ${action} error:`, err);
      Alert.alert("Action Failed", err.message || "Failed to process request");
      throw err;
    } finally {
      setIsProcessing(null);
    }
  };

  return { handleAction, isProcessing };
};
