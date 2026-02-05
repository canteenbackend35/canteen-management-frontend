import { CartBar } from "@/components/CartBar";
import { useCart } from "@/context/CartContext";
import { menuService } from "@/features/menu/services/menuService";
import { api, API_ENDPOINTS } from "@/lib/api-client";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Divider, IconButton, Surface, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

type MenuItem = {
  menu_item_id: number;
  name: string;
  price: number;
  status?: string;
  category?: string;
  description?: string;
};

type StoreInfo = {
  store_id: number;
  name: string;
  status: string;
  location?: string;
};

export default function StoreMenuScreen() {
  const { storeid } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { items, addItem, updateQuantity, currentStoreId, clearCart } = useCart();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!storeid) return;
      
      const [menuData, storesData] = await Promise.all([
        menuService.getStoreMenu(String(storeid)),
        api.get<StoreInfo[]>(API_ENDPOINTS.STORES.LIST, false)
      ]);

      setMenuItems(menuData);
      const info = storesData.find(s => String(s.store_id) === String(storeid));
      if (info) setStoreInfo(info);
    } catch (err: any) {
      setError(err.message || "Failed to load menu");
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  }, [storeid]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchMenuData();
    setRefreshing(false);
  }, [fetchMenuData]);

  useEffect(() => {
    if (storeid) {
      fetchMenuData();
    }
  }, [storeid, fetchMenuData]);

  const handleAddToCart = (item: MenuItem) => {
    if (item.status === 'OUT_OF_STOCK' || storeInfo?.status === 'CLOSED') {
      return;
    }

    const sId = String(storeid);
    
    if (currentStoreId && String(currentStoreId) !== String(sId)) {
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Fetching menu...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="alert-circle-outline" size={60} iconColor={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button mode="contained" onPress={fetchMenuData} style={styles.retryButton}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.headerTop}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          <View style={styles.headerInfo}>
            <Text style={[styles.storeName, { color: theme.colors.onSurface }]}>{storeInfo?.name || "Store Menu"}</Text>
          </View>
        </View>
      </Surface>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.menu_item_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListHeaderComponent={
          <>
            {items.length > 0 && String(currentStoreId) !== String(storeid) && (
              <Surface style={[styles.otherStoreBanner, { 
                backgroundColor: theme.colors.primaryContainer,
                borderColor: theme.colors.primary + '30'
              }]} elevation={1}>
                <IconButton icon="information-outline" size={20} iconColor={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerText, { color: theme.colors.onSurface }]}>Cart contains items from another store</Text>
                </View>
                <Button 
                  mode="text" 
                  onPress={clearCart} 
                  textColor={theme.colors.error}
                  labelStyle={{ fontWeight: '900', fontSize: 12 }}
                >
                  Clear Cart
                </Button>
              </Surface>
            )}
            <View style={{ height: 16 }} />
          </>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const quantity = getItemQuantity(item.menu_item_id);
          const isSoldOut = item.status === 'OUT_OF_STOCK';
          const isClosed = storeInfo?.status === 'CLOSED';
          const isDisabled = isSoldOut || isClosed;
          
          return (
            <Animated.View 
              entering={FadeInDown.delay(index * 50).springify()} 
              layout={Layout.springify()}
            >
              <Card style={[styles.itemCard, { opacity: isDisabled ? 0.7 : 1 }]} elevation={0}>
                <View style={styles.cardInner}>
                  <View style={styles.infoSection}>
                    <Text style={[styles.itemName, { color: isDisabled ? theme.colors.outline : theme.colors.onSurface }]}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={[styles.itemDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={[styles.itemPrice, { color: isDisabled ? theme.colors.outline : theme.colors.primary }]}>
                      ₹{item.price.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.actionSection}>
                    {isSoldOut ? (
                      <Text style={[styles.soldOutBadge, { color: theme.colors.error, borderColor: theme.colors.error }]}>SOLD OUT</Text>
                    ) : isClosed ? (
                      <Text style={[styles.soldOutBadge, { color: theme.colors.outline, borderColor: theme.colors.outline }]}>CLOSED</Text>
                    ) : quantity > 0 ? (
                      <View style={[styles.quantityBox, { backgroundColor: theme.colors.primaryContainer }]}>
                        <IconButton
                          icon="minus"
                          size={16}
                          iconColor={theme.colors.primary}
                          style={styles.qBtn}
                          onPress={() => updateQuantity(item.menu_item_id, -1)}
                        />
                        <Text style={[styles.qText, { color: theme.colors.primary }]}>{quantity}</Text>
                        <IconButton
                          icon="plus"
                          size={16}
                          iconColor={theme.colors.primary}
                          style={styles.qBtn}
                          onPress={() => updateQuantity(item.menu_item_id, 1)}
                        />
                      </View>
                    ) : (
                      <Button 
                        mode="outlined" 
                        onPress={() => handleAddToCart(item)}
                        style={[styles.addBtn, { borderColor: theme.colors.primary }]}
                        textColor={theme.colors.primary}
                        labelStyle={styles.addBtnLabel}
                        compact
                      >
                        ADD
                      </Button>
                    )}
                  </View>
                </View>
                <Divider />
              </Card>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="food-off-outline" size={60} iconColor={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No items in this category.</Text>
          </View>
        }
      />
      
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: -4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 8,
    gap: 8,
  },
  categoryChip: {
    borderRadius: 12,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 140,
  },
  itemCard: {
    backgroundColor: 'transparent',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
    opacity: 0.8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
  },
  actionSection: {
    alignItems: 'center',
    width: 100,
  },
  addBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '100%',
  },
  addBtnLabel: {
    fontWeight: '900',
    fontSize: 13,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  qBtn: {
    margin: 0,
    width: 32,
    height: 32,
  },
  qText: {
    fontSize: 16,
    fontWeight: '900',
  },
  soldOutBadge: {
    fontSize: 10,
    fontWeight: '900',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '600' },
  emptyContainer: { marginTop: 80, alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  retryButton: {
    borderRadius: 12,
  },
  otherStoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingRight: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
});

