import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { addressApi } from "@/lib/api";
import { Colors } from "@/constants/theme";
import type { Address } from "@/types";

export default function AddressListScreen() {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await addressApi.list();
      setItems(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleRemove = (item: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${item.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id);
            const snapshot = items;
            setItems((prev) => prev.filter((it) => it.id !== item.id));
            try {
              await addressApi.remove(item.id);
              push("Address deleted");
            } catch (err) {
              setItems(snapshot);
              push(
                err instanceof Error
                  ? err.message
                  : "Failed to delete address",
                "error"
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <View style={{ width: 38 }} />
      </View>

      {Boolean(error) && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.mossDark}
              />
            </View>

            <View style={styles.addressInfo}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{item.label}</Text>
                {item.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>

              <Text style={styles.receiverName}>
                {item.receiver_name} · {item.phone}
              </Text>

              <Text style={styles.addressLine}>
                {[item.address, item.city, item.province, item.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(`/address/${item.id}` as any)}
              >
                <Ionicons name="pencil-outline" size={16} color={Colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                disabled={deletingId === item.id}
                onPress={() => handleRemove(item)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={Colors.coral}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="location-outline"
                size={54}
                color={Colors.inkSoft}
              />
              <Text style={styles.emptyTitle}>No saved addresses</Text>
              <Text style={styles.emptySub}>
                Add a delivery address to complete your checkout.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={Colors.moss} />
            </View>
          )
        }
      />

      <View style={styles.bottomBar}>
        <Button
          onPress={() => router.push("/address/new" as any)}
          style={{ width: "100%" }}
        >
          Add New Address
        </Button>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.ink,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
  },
  defaultBadge: {
    backgroundColor: Colors.mossDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  receiverName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.ink,
    marginTop: 2,
  },
  addressLine: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 4,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "column",
    gap: 6,
    marginLeft: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.grayLight,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.ink,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.inkSoft,
    textAlign: "center",
    marginTop: 6,
  },
});
