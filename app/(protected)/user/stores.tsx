import { CartBar } from "@/components/CartBar";
import { storeService } from "@/features/store/services/storeService";
import { Store } from "@/types";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, IconButton, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function StoreListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storeService.getStores();
      setStores(data);
    } catch (err: any) {
      setError(err.message || "Failed to load stores");
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (storeId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/store/${storeId}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Finding nearby stores...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="alert-circle-outline" size={60} iconColor={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchStores}
          style={styles.retryButton}
          buttonColor={theme.colors.primary}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.brandTitle, { color: theme.colors.primary }]}>CraveCart</Text>
        <Text style={[styles.header, { color: theme.colors.onSurface }]}>Available Stores</Text>
      </View>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.store_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        renderItem={({ item, index }) => {
          const isClosed = item.status === 'CLOSED';
          return (
            <TouchableOpacity 
              onPress={() => handlePress(item.store_id)} 
              activeOpacity={isClosed ? 1 : 0.7}
              disabled={isClosed}
            >
              <Animated.View entering={FadeInDown.delay(index * 50).springify()} layout={Layout.springify()}>
                <Card 
                  style={[
                    styles.card, 
                    { 
                      backgroundColor: theme.colors.surface, 
                      borderColor: theme.colors.outline,
                      opacity: isClosed ? 0.6 : 1
                    }
                  ]} 
                  elevation={0}
                >
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.storeInfo}>
                      <Text style={[styles.storeName, { color: theme.colors.onSurface }]}>{item.store_name}</Text>
                      {isClosed && (
                        <View style={[styles.statusBadge, { backgroundColor: theme.colors.errorContainer }]}>
                          <Text style={[styles.statusText, { color: theme.colors.error }]}>CLOSED</Text>
                        </View>
                      )}
                    </View>
                    <IconButton 
                      icon={isClosed ? "store-off-outline" : "chevron-right"} 
                      iconColor={isClosed ? theme.colors.error : theme.colors.onSurfaceVariant} 
                      size={20} 
                    />
                  </Card.Content>
                </Card>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="store-off-outline" size={60} iconColor={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No stores are currently open</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  header: { 
    fontSize: 15, 
    fontWeight: "600",
    opacity: 0.6,
    letterSpacing: 0,
    marginTop: -2,
  },
  card: { 
    marginBottom: 12, 
    borderRadius: 16, 
    borderWidth: 1,
    marginHorizontal: 16,
    overflow: 'hidden'
  },
  cardContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingRight: 8, 
    paddingVertical: 12 
  },
  storeInfo: { flex: 1, paddingLeft: 4 },
  storeName: { fontSize: 17, fontWeight: "800" },
  statusBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 8, 
    marginTop: 6 
  },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: 'uppercase' },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: "500" },
  errorText: { marginBottom: 16, textAlign: "center", fontSize: 16 },
  retryButton: { borderRadius: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: "center", fontSize: 17, fontWeight: "600", marginTop: 12 },
  listContent: { paddingBottom: 120, paddingTop: 10 },
});
