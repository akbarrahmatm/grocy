import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Colors, FontFamily } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      push("Please sign in to view your profile", "error");
    }
  }, [authLoading, user]);

  if (!authLoading && !user) {
    return <Redirect href="/auth/login" />;
  }

  if (authLoading || !user) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            push("Signed out successfully");
          } catch (err) {
            push(
              err instanceof Error ? err.message : "Failed to sign out",
              "error"
            );
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Menu List */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/orders" as any)}
        >
          <View style={styles.menuIconWrap}>
            <Ionicons name="receipt-outline" size={18} color={Colors.ink} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>My Orders</Text>
            <Text style={styles.menuSub}>Track purchases &amp; delivery</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.inkSoft} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/address" as any)}
        >
          <View style={styles.menuIconWrap}>
            <Ionicons name="location-outline" size={18} color={Colors.ink} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>Delivery Addresses</Text>
            <Text style={styles.menuSub}>Manage saved delivery locations</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.inkSoft} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          disabled={loggingOut}
          onPress={handleLogout}
        >
          <View style={[styles.menuIconWrap, styles.logoutIconWrap]}>
            <Ionicons name="log-out-outline" size={18} color={Colors.coral} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={[styles.menuTitle, styles.logoutTitle]}>
              {loggingOut ? "Signing out…" : "Sign Out"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: Colors.mossDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  menuContainer: {
    marginHorizontal: 16,
    backgroundColor: Colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.grayLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: Colors.ink,
  },
  menuSub: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIconWrap: {
    backgroundColor: Colors.redLight,
  },
  logoutTitle: {
    color: Colors.coral,
    fontFamily: FontFamily.semiBold,
  },
});
