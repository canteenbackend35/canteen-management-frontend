import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Surface, Text, useTheme } from 'react-native-paper';
import { useCart } from '../context/CartContext';
import { api, API_ENDPOINTS } from '../lib/api-client';

export default function PaymentScreen() {
  const { items, totalPrice, currentStoreId, clearCart } = useCart();
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<number[]>([]);

  // Industrial Grade Check: Validate cart items against live backend data
  React.useEffect(() => {
    const validateCart = async () => {
      if (!currentStoreId) return;
      try {
        setValidating(true);
        // 1. Fetch live menu and stores list (to check open status)
        const [liveMenu, liveStores] = await Promise.all([
          api.get<any[]>(API_ENDPOINTS.STORES.MENU(currentStoreId), false),
          api.get<any[]>(API_ENDPOINTS.STORES.LIST, false)
        ]);

        const currentStore = liveStores.find(s => String(s.store_id) === currentStoreId);
        
        // 2. Check Store Status
        if (currentStore && currentStore.status === 'CLOSED') {
          setValidationError("The canteen is now CLOSED. Please try again later.");
          return;
        }

        // 3. Check specific Item Availability
        const currentlyUnavailable: number[] = [];
        items.forEach(cartItem => {
          const liveItem = liveMenu.find(m => m.menu_item_id === cartItem.id);
          if (!liveItem || liveItem.status === 'OUT_OF_STOCK') {
            currentlyUnavailable.push(cartItem.id);
          }
        });

        if (currentlyUnavailable.length > 0) {
          setUnavailableItems(currentlyUnavailable);
          setValidationError("Some items in your cart are no longer available.");
        } else {
          setValidationError(null);
        }

      } catch (err) {
        console.error("Validation error:", err);
        // We don't block if API fails, but ideally we should.
      } finally {
        setValidating(false);
      }
    };

    validateCart();
  }, [currentStoreId, items]);

  const handlePlaceOrder = async () => {
    if (!currentStoreId) {
      Alert.alert("Error", "No store selected.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        store_id: parseInt(currentStoreId, 10),
        payment_id: `PAY-${Date.now()}`,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, orderData, true);

      if (response.success) {
        const orderOtp = response.order_otp;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        clearCart();
        
        Alert.alert(
          "Success!",
          `Order placed! Your OTP is ${orderOtp}. Please show this at the counter.`,
          [
            { 
              text: "OK", 
              onPress: () => router.replace('/(protected)/user/stores') 
            }
          ]
        );
      } else {
        throw new Error(response.UImessage || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      Alert.alert("Error", error.message || "Something went wrong while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>No items to pay for.</Text>
        <Button onPress={() => router.back()} textColor={theme.colors.primary}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={theme.colors.onSurface} />
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Checkout</Text>
        <View style={{ width: 48 }}>
             {validating && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>
      </View>

      {validationError && (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <IconButton icon="alert-decagram" iconColor={theme.colors.error} size={20} />
          <Text style={[styles.errorBannerText, { color: theme.colors.error }]}>{validationError}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]} elevation={0}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Order Summary</Text>
            {items.map((item) => {
              const isItemUnavailable = unavailableItems.includes(item.id);
              return (
                <List.Item
                  key={item.id}
                  title={item.name}
                  description={isItemUnavailable ? "STORE OUT OF STOCK" : `Quantity: ${item.quantity}`}
                  titleStyle={{ 
                    color: isItemUnavailable ? theme.colors.outline : theme.colors.onSurface, 
                    fontWeight: '700',
                    textDecorationLine: isItemUnavailable ? 'line-through' : 'none'
                  }}
                  descriptionStyle={{ color: isItemUnavailable ? theme.colors.error : theme.colors.onSurfaceVariant, fontWeight: isItemUnavailable ? '800' : '400' }}
                  right={() => <Text style={[styles.itemPrice, { color: isItemUnavailable ? theme.colors.outline : theme.colors.onSurface }]}>₹{(item.price * item.quantity).toFixed(2)}</Text>}
                  style={styles.listItem}
                />
              );
            })}
            <Divider style={{ marginVertical: 12, backgroundColor: theme.colors.outline }} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>₹{totalPrice.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>

      <Surface style={[styles.footer, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <Button 
          mode="contained" 
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading || !!validationError || validating}
          style={styles.placeOrderBtn}
          buttonColor={validationError ? theme.colors.outline : theme.colors.primary}
          contentStyle={styles.placeOrderBtnContent}
        >
          {validationError ? "Cannot Place Order" : (loading ? "Placing Order..." : "Confirm & Place Order")}
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scroll: {
    padding: 16,
    paddingBottom: 160,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    alignSelf: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  placeOrderBtn: {
    borderRadius: 14,
  },
  placeOrderBtnContent: {
    height: 52,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    marginBottom: 0,
  },
  errorBannerText: {
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  }
});

