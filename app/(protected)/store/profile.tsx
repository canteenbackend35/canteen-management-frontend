import { api, API_ENDPOINTS } from "@/lib/api-client";
import { User } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Divider, List, Text, useTheme } from "react-native-paper";

const StoreProfilePage = () => {
  const theme = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        setProfile(response.user || response);
      } catch (err) {
        console.error("Failed to fetch store profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    router.replace("/auth");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Icon size={64} icon="store" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{profile?.name || "Canteen Owner"}</Text>
        <Text style={[styles.role, { color: theme.colors.onSurfaceVariant }]}>Store Administrator</Text>
        <Text style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}>+91 {profile?.phone_no}</Text>
      </View>

      <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
        <Card.Content>
          <List.Item
            title="Business ID"
            description={`STR-${profile?.store_id || "N/A"}`}
            left={props => <List.Icon {...props} icon="identifier" />}
          />
          <Divider />
          <List.Item
            title="Support"
            description="Contact Canteen Admin"
            left={props => <List.Icon {...props} icon="help-circle-outline" />}
          />
        </Card.Content>
      </Card>

      <Button 
        mode="outlined" 
        onPress={handleLogout} 
        style={[styles.logoutBtn, { borderColor: theme.colors.errorContainer }]}
        textColor={theme.colors.error}
        icon="logout"
      >
        Logout Session
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    marginHorizontal: 16,
  },
  logoutBtn: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
});

export default StoreProfilePage;
