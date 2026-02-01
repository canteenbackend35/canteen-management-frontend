import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Divider, IconButton, List, Surface, Text, useTheme } from 'react-native-paper';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const { items, totalPrice, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const theme = useTheme();

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="cart-outline" size={80} iconColor={theme.colors.outline} />
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Your cart is empty</Text>
        <Button 
          mode="contained" 
          onPress={() => router.replace('/(protected)/user/dashboard')}
          style={styles.browseButton}
          buttonColor={theme.colors.primary}
        >
          Browse Stores
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={theme.colors.onSurface} />
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Cart Summary</Text>
        <Button onPress={clearCart} textColor={theme.colors.error} mode="text" compact>Clear</Button>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`₹${item.price.toFixed(2)} per unit`}
            titleStyle={[styles.itemName, { color: theme.colors.onSurface }]}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            right={() => (
              <View style={styles.quantityRow}>
                <IconButton
                  icon="minus"
                  size={18}
                  mode="outlined"
                  onPress={() => updateQuantity(item.id, -1)}
                  style={styles.qtyBtn}
                  iconColor={theme.colors.primary}
                />
                <Text style={[styles.qtyText, { color: theme.colors.onSurface }]}>{item.quantity}</Text>
                <IconButton
                  icon="plus"
                  size={18}
                  mode="contained"
                  onPress={() => updateQuantity(item.id, 1)}
                  style={styles.qtyBtn}
                  containerColor={theme.colors.primary}
                  iconColor={theme.colors.onPrimary}
                />
              </View>
            )}
            style={{ backgroundColor: theme.colors.surface }}
          />
        )}
        ItemSeparatorComponent={() => <Divider style={{ backgroundColor: theme.colors.outline }} />}
        contentContainerStyle={styles.list}
      />

      <Surface style={[styles.footer, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Grand Total</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>₹{totalPrice.toFixed(2)}</Text>
        </View>
        <Button 
          mode="contained" 
          onPress={() => router.push('/payment')}
          style={styles.checkoutBtn}
          buttonColor={theme.colors.primary}
          contentStyle={styles.checkoutBtnContent}
        >
          Proceed to Pay
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    marginTop: 8,
  },
  browseButton: {
    borderRadius: 14,
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 140,
  },
  itemName: {
    fontWeight: '700',
    fontSize: 17,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    margin: 0,
    width: 32,
    height: 32,
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  checkoutBtn: {
    borderRadius: 16,
  },
  checkoutBtnContent: {
    height: 56,
  },
});

