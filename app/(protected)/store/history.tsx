import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types";
import React, { useMemo } from "react";
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, View } from "react-native";
import { Card, Chip, Divider, Text, useTheme } from "react-native-paper";

const StoreHistoryPage = () => {
  const theme = useTheme() as any;
  
  const { 
    orders, 
    loading, 
    refreshing, 
    onRefresh 
  } = useOrders('store');

  const [filterType, setFilterType] = React.useState<'TODAY' | 'ALL'>('TODAY');

  const { sections, dailyTotal, dailyCount } = useMemo(() => {
    const historical = orders
      .filter(o => ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.order_status.toUpperCase()))
      .sort((a,b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    const groups: Record<string, Order[]> = {};
    let total = 0;
    let count = 0;

    historical.forEach(order => {
      const date = new Date(order.order_date).toLocaleDateString();
      const isToday = date === today;
      const isYesterday = date === yesterdayStr;
      
      const title = isToday ? "Today" : isYesterday ? "Yesterday" : date;
      
      if (isToday && (order.order_status === 'DELIVERED' || order.order_status.toUpperCase() === 'COMPLETED')) {
        total += order.total_price;
        count += 1;
      }

      if (filterType === 'TODAY' && !isToday) return;

      if (!groups[title]) groups[title] = [];
      groups[title].push(order);
    });

    const sectionsData = Object.keys(groups).map(title => ({
      title,
      data: groups[title]
    }));

    return { sections: sectionsData, dailyTotal: total, dailyCount: count };
  }, [orders, filterType]);

  const renderOrder = ({ item }: { item: Order }) => {
    const isCancelled = item.order_status.toUpperCase() === 'CANCELLED';
    return (
      <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
        <Card.Content style={styles.cardContent}>
          <View>
            <Text style={[styles.orderId, { color: theme.colors.onSurface }]}>Order #{item.order_id}</Text>
            <Text style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(item.order_date).toLocaleDateString()} at {new Date(item.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: isCancelled ? theme.colors.error : theme.colors.primary }]}>
              ₹{item.total_price.toFixed(2)}
            </Text>
            <Text style={[styles.statusLabel, { color: isCancelled ? theme.colors.error : theme.colors.primary }]}>
              {item.order_status}
            </Text>
          </View>
        </Card.Content>
      </Card>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View>
                  <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Order History</Text>
                  <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>Review your past sales</Text>
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
            
            <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
              <Card.Content style={styles.summaryContent}>
                <View>
                  <Text style={[styles.summaryLabel, { color: theme.colors.onPrimaryContainer }]}>Today's Sales</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.onPrimaryContainer }]}>₹{dailyTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryStats}>
                  <Chip icon="check-circle" style={styles.statChip}>{dailyCount} Orders</Chip>
                </View>
              </Card.Content>
            </Card>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No history found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -1,
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
  summaryCard: {
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStats: {
    alignItems: 'flex-end',
  },
  statChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  card: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.6,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: '900',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
});

export default StoreHistoryPage;
