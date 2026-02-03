import { STATUS_COLORS } from '@/lib/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

interface StatusBadgeProps {
  status: string;
  style?: ViewStyle;
}

/**
 * Standardized badge for displaying order status.
 * Reusable across cards, detail modals, and history lists.
 */
export const StatusBadge = ({ status, style }: StatusBadgeProps) => {
  const normStatus = status.toUpperCase();
  const color = STATUS_COLORS[normStatus as keyof typeof STATUS_COLORS] || '#666';

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }, style]}>
      <Text style={[styles.text, { color }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
