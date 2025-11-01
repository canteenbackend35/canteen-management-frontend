import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

const liveOrders = [
  {
    id: "1",
    name: "Order #101",
    status: "Preparing",
    details: "2x Burger, 1x Coke",
  },
  {
    id: "2",
    name: "Order #102",
    status: "Delivered",
    details: "1x Pizza, 2x Lemonade",
  },
  { id: "3", name: "Order #103", status: "Pending", details: "3x Sandwich" },
];

const LiveOrdersPage = () => {
  const renderOrder = ({ item }) => (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <Text variant="titleMedium">{item.name}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Details: {item.details}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={liveOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text variant="headlineMedium" style={styles.heading}>
            Live Orders
          </Text>
        }
        ListHeaderComponentStyle={{ marginBottom: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heading: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
});

export default LiveOrdersPage;
