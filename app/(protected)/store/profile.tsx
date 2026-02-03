import { authService } from "@/features/auth/services/authService";
import { storeService } from "@/features/store/services/storeService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Divider, List, Switch, Text, useTheme } from "react-native-paper";

const StoreProfilePage = () => {
  const theme = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        // The backend returns { success: true, role, user: store, store }
        // We extract the store object which contains store_name, phone_no, store_id
        const data = response.store || response.user || response;
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch store profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleStoreStatus = async () => {
    try {
      setToggling(true);
      const newStatus = profile.status === 'OPEN' ? 'CLOSED' : 'OPEN';
      const response = await storeService.updateStatus(newStatus);
      
      if (response.success) {
        setProfile({ ...profile, status: newStatus });
      } else {
        alert(response.UImessage || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Status toggle error:", err);
      alert(err.message || "Failed to connect to server");
    } finally {
      setToggling(false);
    }
  };

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

  // Map backend fields to UI labels
  const storeName = profile?.store_name || profile?.name || "Canteen Owner";
  const storePhone = profile?.phone_no || profile?.phone || "N/A";
  const businessId = profile?.store_id ? `STR-${profile.store_id}` : "N/A";

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Icon 
          size={80} 
          icon="store" 
          style={{ backgroundColor: theme.colors.primaryContainer }} 
          color={theme.colors.primary} 
        />
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{storeName}</Text>
        <Text style={[styles.role, { color: theme.colors.onSurfaceVariant }]}>Store Administrator</Text>
        <Text style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}>+91 {storePhone}</Text>
      </View>

      <View style={styles.content}>
        <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
          <Card.Content>
            <List.Item
              title="Business Identity"
              description={businessId}
              left={props => <List.Icon {...props} icon="badge-account-horizontal-outline" />}
            />
            <Divider />
            <List.Item
              title="Payment Setup"
              description={profile?.payment_details || "Standard QR Payment"}
              left={props => <List.Icon {...props} icon="qrcode" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
          <Card.Content>
            <List.Item
              title="Operational Status"
              description={profile?.status === 'OPEN' ? "Taking Orders" : "Closed / Not Syncing"}
              left={props => <List.Icon {...props} icon={profile?.status === 'OPEN' ? "store-check" : "store-remove"} />}
              descriptionStyle={{ color: profile?.status === 'OPEN' ? theme.colors.primary : theme.colors.error, fontWeight: '700' }}
              right={() => (
                <View style={{ justifyContent: 'center' }}>
                    <Switch 
                        value={profile?.status === 'OPEN'} 
                        onValueChange={toggleStoreStatus}
                        disabled={toggling}
                        color={theme.colors.primary}
                    />
                </View>
              )}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              description="Contact Platform Admin"
              left={props => <List.Icon {...props} icon="help-circle-outline" />}
            />
          </Card.Content>
        </Card>

        <Button 
          mode="contained-tonal" 
          onPress={handleLogout} 
          style={styles.logoutBtn}
          textColor={theme.colors.error}
          icon="logout"
        >
          Logout Session
        </Button>
      </View>
    </ScrollView>
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
    paddingVertical: 40,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  phone: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  logoutBtn: {
    borderRadius: 12,
    marginTop: 24,
    height: 54,
    justifyContent: 'center',
  },
});

export default StoreProfilePage;
