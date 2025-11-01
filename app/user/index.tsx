import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";

const stores = [
  { id: "1", name: "Store 1", description: "Snacks & Beverages" },
  { id: "2", name: "Store 2", description: "Stationery & Supplies" },
];

export default function StoreListScreen() {
  const router = useRouter();

  const handlePress = (storeId: string) => {
    router.push(`/user/store/${storeId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Stores</Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.id)}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeDesc}>{item.description}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  storeDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
