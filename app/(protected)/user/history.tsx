import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { Order } from "@/types";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, View } from "react-native";
import { Chip, Divider, IconButton, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const UserHistoryPage = () => {
  const router = useRouter();
  const theme = useTheme() as any;
  
  const { 
    orders, 
    loading, 
    error,
    refreshing, 
    onRefresh 
  } = useOrders('customer');

  const [filterType, setFilterType] = React.useState<'TODAY' | 'ALL'>('TODAY');

  const sections = useMemo(() => {
    const historical = orders
      .filter(o => ['DELIVERED', 'CANCELLED'].includes(o.order_status.toUpperCase()))
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    const groups: Record<string, Order[]> = {};

    historical.forEach(order => {
      const date = new Date(order.order_date).toLocaleDateString();
      const isToday = date === today;
      const title = isToday ? "Today" : date === yesterdayStr ? "Yesterday" : date;
      
      if (filterType === 'TODAY' && !isToday) return;

      if (!groups[title]) groups[title] = [];
      groups[title].push(order);
    });

    return Object.keys(groups).map(title => ({
      title,
      data: groups[title]
    }));
  }, [orders, filterType]);

  // redundant logic removed

  const renderOrder = ({ item, index }: { item: Order, index: number }) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()} 
        layout={Layout.springify()}
      >
        <OrderCard 
          order={item} 
          showAbsoluteTime={true}
          style={{ 
            opacity: item.order_status.toUpperCase() === 'CANCELLED' ? 0.7 : 1,
            marginHorizontal: 16,
            marginBottom: 8
          }}
        />
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
      <Divider style={styles.sectionDivider} />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={renderOrder}
        renderSectionHeader={renderSectionHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Order History</Text>
                <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>Your past cravings</Text>
              </View>
              <View style={styles.filterRow}>
                <Chip 
                  selected={filterType === 'TODAY'} 
                  onPress={() => setFilterType('TODAY')}
                  style={styles.filterChip}
                  selectedColor={theme.colors.primary}
                >Today</Chip>
                <Chip 
                  selected={filterType === 'ALL'} 
                  onPress={() => setFilterType('ALL')}
                  style={styles.filterChip}
                  selectedColor={theme.colors.primary}
                >All</Chip>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="history" size={60} iconColor={theme.colors.outline} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No past orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  heading: { 
    fontSize: 22, 
    fontWeight: "900", 
    letterSpacing: -1,
    paddingHorizontal: 16
  },
  // styles removed
  listContent: { paddingBottom: 40 },
  header: { 
    marginBottom: 20, 
    marginTop: 10,
    paddingHorizontal: 16
  },
  subheading: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionDivider: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", fontSize: 17, fontWeight: '600', marginTop: 8 },
});

export default UserHistoryPage;
