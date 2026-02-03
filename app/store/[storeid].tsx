import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Button, Divider, IconButton, List, Text, useTheme } from "react-native-paper";

import { CartBar } from "@/components/CartBar";
import { useCart } from "@/context/CartContext";
import { api, API_ENDPOINTS } from "@/lib/api-client";

type MenuItem = {
  menu_item_id: number;
  name: string;
  price: number;
  status?: string;
};

export default function StoreMenuScreen() {
  const { storeid } = useLocalSearchParams();
  const theme = useTheme();
  const { items, addItem, updateQuantity, currentStoreId, clearCart } = useCart();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!storeid) return;
      
      const data = await api.get<MenuItem[]>(API_ENDPOINTS.STORES.MENU(String(storeid)), false);
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load menu");
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  }, [storeid]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchMenu();
    setRefreshing(false);
  }, [fetchMenu]);

  useEffect(() => {
    if (storeid) {
      fetchMenu();
    }
  }, [storeid, fetchMenu]);

  const handleAddToCart = (item: MenuItem) => {
    if (item.status === 'OUT_OF_STOCK') {
      return;
    }

    const sId = String(storeid);
    
    // Check if adding from a different store
    if (currentStoreId && currentStoreId !== sId) {
      Alert.alert(
        "Replace Cart?",
        "Your cart contains items from another store. Do you want to clear your current cart and add items from this store?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Replace", 
            onPress: () => {
              clearCart();
              addItem({
                id: item.menu_item_id,
                name: item.name,
                price: item.price,
                storeId: sId,
              });
            } 
          },
        ]
      );
      return;
    }

    addItem({
      id: item.menu_item_id,
      name: item.name,
      price: item.price,
      storeId: sId,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = items.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Fetching delicious menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button mode="contained" onPress={fetchMenu} style={styles.retryButton} buttonColor={theme.colors.primary}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.menu_item_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        ItemSeparatorComponent={() => <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />}
        ListHeaderComponent={
          currentStoreId && currentStoreId !== String(storeid) ? (
            <View style={[styles.conflictBanner, { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }]}>
              <IconButton icon="alert-circle-outline" iconColor={theme.colors.error} size={24} style={styles.bannerIcon} />
              <View style={styles.bannerTextContainer}>
                <Text style={[styles.conflictTitle, { color: theme.colors.error }]}>Restaurant Conflict</Text>
                <Text style={[styles.conflictSubtitle, { color: theme.colors.error }]}>
                  Your cart contains items from another restaurant. You must clear it to start a new order here.
                </Text>
                <Button 
                  mode="contained" 
                  compact 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    clearCart();
                  }}
                  style={styles.clearBtn}
                  buttonColor={theme.colors.error}
                >
                  Start New Order
                </Button>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const quantity = getItemQuantity(item.menu_item_id);
          
          return (
            <List.Item
              title={item.name}
              description={`₹${item.price.toFixed(2)}`}
              titleStyle={[
                styles.itemName, 
                { color: item.status === 'OUT_OF_STOCK' ? theme.colors.outline : theme.colors.onSurface }
              ]}
              descriptionStyle={[
                styles.itemPrice, 
                { color: item.status === 'OUT_OF_STOCK' ? theme.colors.outline : theme.colors.onSurfaceVariant }
              ]}
              right={() => (
                <View style={styles.actionContainer}>
                  {item.status === 'OUT_OF_STOCK' ? (
                    <Text style={[styles.soldOutText, { color: theme.colors.error }]}>SOLD OUT</Text>
                  ) : quantity > 0 ? (
                    <View style={[styles.quantityRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <IconButton
                        icon="minus"
                        size={20}
                        mode="outlined"
                        onPress={() => updateQuantity(item.menu_item_id, -1)}
                        style={styles.quantityBtn}
                        iconColor={theme.colors.primary}
                      />
                      <Text style={[styles.quantityText, { color: theme.colors.primary }]}>{quantity}</Text>
                      <IconButton
                        icon="plus"
                        size={20}
                        mode="contained"
                        onPress={() => updateQuantity(item.menu_item_id, 1)}
                        style={styles.quantityBtn}
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                      />
                    </View>
                  ) : (
                    <Button 
                      mode="outlined" 
                      compact 
                      onPress={() => handleAddToCart(item)}
                      textColor={theme.colors.primary}
                      style={[styles.addButton, { borderColor: theme.colors.primary }]}
                    >
                      ADD
                    </Button>
                  )}
                </View>
              )}
              style={[
                styles.listItem,
                item.status === 'OUT_OF_STOCK' && { opacity: 0.6 }
              ]}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No items available in this store yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      
      {/* Industrial Grade Floating Cart Bar */}
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 120, // Space for CartBar
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  addButton: {
    borderWidth: 1.5,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  soldOutText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    height: 38,
  },
  quantityBtn: {
    margin: 0,
    width: 30,
    height: 30,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 32,
    fontSize: 16,
  },
  retryButton: {
    borderRadius: 12,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  conflictBanner: {
    margin: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    padding: 12,
    flexDirection: 'row',
  },
  bannerIcon: {
    margin: 0,
    marginTop: -4,
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  conflictSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  clearBtn: {
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
});

