import { api, API_ENDPOINTS } from "@/lib/api-client";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Divider, List, Text, useTheme } from "react-native-paper";

const UserProfilePage = () => {
  const theme = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        // The backend returns { success: true, role, user: customer, customer }
        setProfile(response.customer || response.user || response);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={profile?.name?.substring(0, 2).toUpperCase() || "UN"} 
          style={{ backgroundColor: theme.colors.primaryContainer }} 
          color={theme.colors.primary} 
        />
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{profile?.name || "Customer"}</Text>
        <Text style={[styles.role, { color: theme.colors.onSurfaceVariant }]}>Valued Customer</Text>
        <Text style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}>+91 {profile?.phone_no}</Text>
      </View>

      <View style={styles.content}>
        {(profile?.course || profile?.college) && (
          <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
            <Card.Content>
              {profile?.college && (
                <List.Item
                  title="College"
                  description={profile.college}
                  left={props => <List.Icon {...props} icon="school-outline" />}
                />
              )}
              {profile?.course && profile?.college && <Divider />}
              {profile?.course && (
                <List.Item
                  title="Course"
                  description={profile.course}
                  left={props => <List.Icon {...props} icon="book-education-outline" />}
                />
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={[styles.card, { borderColor: theme.colors.outline }]} elevation={0}>
          <Card.Content>
            <List.Item
              title="Canteen FAQ"
              description="Common questions & answers"
              left={props => <List.Icon {...props} icon="information-outline" />}
            />
            <Divider />
            <List.Item
              title="Customer Support"
              description="We're here to help"
              left={props => <List.Icon {...props} icon="headphones" />}
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
          Sign Out
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

export default UserProfilePage;
