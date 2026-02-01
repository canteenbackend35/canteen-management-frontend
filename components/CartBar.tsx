import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useCart } from '../context/CartContext';

export const CartBar = () => {
  const { totalItems, totalPrice } = useCart();
  const theme = useTheme();
  const router = useRouter();

  if (totalItems === 0) return null;

  return (
    <Surface style={[styles.surface, { backgroundColor: theme.colors.primary }]} elevation={4}>
      <TouchableOpacity 
        style={styles.touchable} 
        activeOpacity={0.9}
        onPress={() => router.push('/cart')}
      >
        <View style={styles.left}>
          <Surface style={[styles.badge, { backgroundColor: theme.colors.surface }]} elevation={0}>
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{totalItems}</Text>
          </Surface>
          <View>
            <Text style={[styles.viewCartText, { color: theme.colors.onPrimary, opacity: 0.8 }]}>View Cart</Text>
            <Text style={[styles.priceText, { color: theme.colors.onPrimary }]}>₹{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.right}>
          <Text style={[styles.checkoutText, { color: theme.colors.onPrimary }]}>Next</Text>
        </View>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 14,
  },
  viewCartText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutText: {
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});

