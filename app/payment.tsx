import { COMPONENT_STYLES, RADIUS, SPACING, TYPOGRAPHY } from '@/lib/theme';
import { createOrderSchema } from '@/lib/validators';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Modal, Portal, Surface, Text, useTheme } from 'react-native-paper';
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Industrial Grade Check: Validate cart items against live backend data
  React.useEffect(() => {
    if (isRedirecting) return;
    
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
      } finally {
        setValidating(false);
      }
    };

    validateCart();
  }, [currentStoreId, items, isRedirecting]);

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

      // Validate with Zod
      const validation = createOrderSchema.safeParse(orderData);
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }

      const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, orderData, true);

      // Lenient check for success
      if (response && (response.success || response.order_id || response.order_otp)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // 1. Set Success States
        setShowSuccessModal(true);
        setIsRedirecting(true);
        
        // 2. Clear Cart
        clearCart();
        
        // 3. Show success modal
        setShowSuccessModal(true);
        
        // 4. Navigate after short delay
        setTimeout(() => {
          console.log('🔄 Navigating to orders page...');
          setShowSuccessModal(false);
          setIsRedirecting(false);
          
          // Navigate to user section with orders tab selected
          try {
            router.replace('/(protected)/user/stores?tab=orders');
            console.log('✅ Navigation completed');
          } catch (error) {
            console.error('❌ Navigation error:', error);
          }
        }, 1500);
      } else {
        throw new Error(response?.UImessage || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      Alert.alert("Error", error.message || "Something went wrong while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (isRedirecting && !showSuccessModal) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.primary, fontWeight: '700' }}>Redirecting to orders...</Text>
      </View>
    );
  }

  if (items.length === 0 && !isRedirecting) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="cart-outline" size={60} iconColor={theme.colors.outline} />
        <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Your cart is empty</Text>
        <Button onPress={() => router.replace('/(protected)/user/stores')} textColor={theme.colors.primary}>Browse Stores</Button>
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
          disabled={loading || !!validationError || validating || isRedirecting}
          style={styles.placeOrderBtn}
          buttonColor={validationError ? theme.colors.outline : theme.colors.primary}
          contentStyle={styles.placeOrderBtnContent}
        >
          {validationError ? "Cannot Place Order" : (loading ? "Placing Order..." : "Confirm & Place Order")}
        </Button>
      </Surface>

      <Portal>
        <Modal
          visible={showSuccessModal}
          dismissable={false}
          contentContainerStyle={[styles.successModal, { backgroundColor: theme.colors.surface }]}
        >
          <IconButton icon="check-circle" size={60} iconColor={theme.colors.primary} style={{ alignSelf: 'center' }} />
          <Text style={[styles.successModalTitle, { color: theme.colors.onSurface }]}>Order Placed!</Text>
          <Text style={[styles.successModalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Your order has been placed successfully. Redirecting you to your orders...
          </Text>
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...COMPONENT_STYLES.container,
  },
  center: {
    ...COMPONENT_STYLES.centerContainer,
  },
  header: {
    ...COMPONENT_STYLES.header,
  },
  headerTitle: {
    ...COMPONENT_STYLES.headerTitle,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.L,
    paddingVertical: SPACING.M,
  },
  errorBannerText: {
    ...TYPOGRAPHY.BODY_SEMIBOLD,
    flex: 1,
  },
  scroll: {
    padding: SPACING.L,
    paddingBottom: SPACING.XXL * 3,
  },
  card: {
    borderRadius: RADIUS.L,
    borderWidth: 1,
    marginBottom: SPACING.L,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H3,
    marginBottom: SPACING.M,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  itemPrice: {
    ...TYPOGRAPHY.SUBTITLE,
    paddingRight: SPACING.M,
  },
  totalRow: {
    ...COMPONENT_STYLES.rowSpaceBetween,
    marginTop: SPACING.S,
  },
  totalLabel: {
    ...TYPOGRAPHY.SUBTITLE,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  totalValue: {
    ...TYPOGRAPHY.H2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.L,
    paddingBottom: SPACING.XXL,
    borderTopLeftRadius: RADIUS.XXL,
    borderTopRightRadius: RADIUS.XXL,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  placeOrderBtn: {
    borderRadius: RADIUS.L,
  },
  placeOrderBtnContent: {
    height: 52,
  },
  successModal: {
    margin: SPACING.L,
    padding: SPACING.XXL,
    borderRadius: RADIUS.XXL,
    maxWidth: 400,
    alignSelf: 'center',
    width: '90%',
  },
  successModalTitle: {
    ...TYPOGRAPHY.H2,
    textAlign: 'center',
    marginTop: SPACING.M,
  },
  successModalSubtitle: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    marginTop: SPACING.S,
  },
});
