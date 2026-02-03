import { api, API_ENDPOINTS } from "@/lib/api-client";
import { MenuItem } from "@/types";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button, Card, FAB, IconButton, Modal, Portal, Switch, Text, TextInput, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const StoreMenuPage = () => {
  const theme = useTheme() as any;
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<'AVAILABLE' | 'OUT_OF_STOCK'>('AVAILABLE');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const meResponse = await api.get(API_ENDPOINTS.AUTH.ME);
      const storeId = meResponse.store_id || meResponse.user?.store_id;

      if (!storeId) {
        throw new Error("Store identity not found");
      }

      const response = await api.get<any>(API_ENDPOINTS.STORES.MENU(storeId));
      const menuData = Array.isArray(response) ? response : (response.menu || []);
      setItems(menuData);
    } catch (err: any) {
      setError(err.message || "Failed to load menu");
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchMenu();
    setRefreshing(false);
  }, []);

  const toggleAvailability = async (itemId: number, currentStatus: MenuItem['status']) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newStatus = currentStatus === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
      
      setItems(prev => prev.map(item => 
        item.menu_item_id === itemId ? { ...item, status: newStatus } : item
      ));

      await api.put(API_ENDPOINTS.MENU_MGMT.UPDATE(itemId), {
        status: newStatus
      });
    } catch (err: any) {
      console.error("Failed to toggle availability:", err);
      setItems(prev => prev.map(item => 
        item.menu_item_id === itemId ? { ...item, status: currentStatus } : item
      ));
    }
  };

  const openModal = (item?: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setPrice(item.price.toString());
      setStatus(item.status);
    } else {
      setEditingItem(null);
      setName("");
      setPrice("");
      setStatus('AVAILABLE');
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!name || !price) return;
    
    setSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const meResponse = await api.get(API_ENDPOINTS.AUTH.ME);
      const storeId = meResponse.store_id || meResponse.user?.store_id;

      const payload = {
        store_id: storeId,
        name,
        price: parseFloat(price),
        status
      };

      if (editingItem) {
        await api.put(API_ENDPOINTS.MENU_MGMT.UPDATE(editingItem.menu_item_id), payload);
      } else {
        await api.post(API_ENDPOINTS.MENU_MGMT.CREATE, payload);
      }
      
      await fetchMenu();
      closeModal();
    } catch (err: any) {
      console.error("Failed to save menu item:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await api.delete(API_ENDPOINTS.MENU_MGMT.DELETE(itemId));
      setItems(prev => prev.filter(i => i.menu_item_id !== itemId));
    } catch (err: any) {
      console.error("Failed to delete item:", err);
    }
  };

  const renderItem = ({ item, index }: { item: MenuItem, index: number }) => {
    const isAvailable = item.status === 'AVAILABLE';
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 30).springify()} 
        layout={Layout.springify()}
      >
        <Card 
          style={[
            styles.itemCard, 
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }
          ]} 
          elevation={0}
        >
          <View style={styles.cardInner}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>{item.name}</Text>
              <View style={styles.itemMeta}>
                <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>₹{item.price}</Text>
              </View>
            </View>
            
            <View style={styles.actions}>
              <IconButton 
                icon="pencil-outline" 
                size={20} 
                iconColor={theme.colors.onSurfaceVariant} 
                onPress={() => openModal(item)}
              />
              <IconButton 
                icon="delete-outline" 
                size={20} 
                iconColor={theme.colors.error} 
                onPress={() => handleDelete(item.menu_item_id)}
              />
              <View style={styles.divider} />
              <View style={styles.toggleSection}>
                <Switch 
                  value={isAvailable} 
                  onValueChange={() => toggleAvailability(item.menu_item_id, item.status)}
                  color={theme.colors.primary}
                />
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading Menu...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.menu_item_id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Menu Manager</Text>
            <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>Manage your store items and prices</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Add Item"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => openModal()}
      />

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={closeModal}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {editingItem ? "Edit Menu Item" : "Add New Item"}
          </Text>
          
          <TextInput
            label="Item Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.formInput}
          />
          
          <TextInput
            label="Price (₹)"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            keyboardType="numeric"
            style={styles.formInput}
          />

          <View style={styles.availabilityRow}>
            <Text style={{ fontWeight: '600', color: theme.colors.onSurface }}>Item Available</Text>
            <Switch 
              value={status === 'AVAILABLE'} 
              onValueChange={(val) => setStatus(val ? 'AVAILABLE' : 'OUT_OF_STOCK')}
              color={theme.colors.primary}
            />
          </View>

          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={saving}
            disabled={saving || !name || !price}
            style={styles.saveBtn}
            contentStyle={{ height: 48 }}
          >
            {editingItem ? "Update Item" : "Create Item"}
          </Button>
          
          <Button mode="text" onPress={closeModal} disabled={saving}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  header: { padding: 20, paddingTop: 10 },
  heading: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  subheading: { fontSize: 13, fontWeight: "600", marginTop: 2, opacity: 0.7 },
  
  itemCard: { 
    marginBottom: 8, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginHorizontal: 16,
  },
  cardInner: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 12,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: '800' },
  dot: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 8 },
  itemCategory: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  
  toggleSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', width: 45, textAlign: 'right' },
  
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  listContent: { paddingBottom: 100 },
  
  // New Styles
  actions: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 24, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  modalContent: {
    padding: 24,
    margin: 20,
    borderRadius: 24,
    maxWidth: 500,
    width: '90%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  formInput: {
    marginBottom: 16,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 12,
  },
});

export default StoreMenuPage;
