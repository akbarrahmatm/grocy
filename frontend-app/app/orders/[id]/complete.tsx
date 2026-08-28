import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { orderApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Colors } from "@/constants/theme";
import type { Order } from "@/types";

const POLL_MS = 3000;
const MAX_POLLS = 13;

export default function OrderCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [polls, setPolls] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    orderApi
      .show(Number(id))
      .then(setOrder)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load order");
      });
  }, [id]);

  const pending = order !== null && order.status === "pending";

  useEffect(() => {
    if (!pending || polls >= MAX_POLLS || !id) return;
    const timer = setTimeout(() => {
      orderApi
        .show(Number(id))
        .then((res) => {
          setOrder(res);
          setPolls((p) => p + 1);
        })
        .catch(() => {});
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [pending, polls, id]);

  const paid = order !== null && order.paid_at !== null;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {order === null && !error ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.moss} />
            <Text style={styles.loadingText}>Loading order status…</Text>
          </View>
        ) : error || !order ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error ?? "Order not found"}</Text>
            <Button
              variant="ghost"
              onPress={() => router.replace("/(tabs)/orders" as any)}
              style={{ marginTop: 16 }}
            >
              Back to Orders
            </Button>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              {paid || order.status !== "pending" ? (
                <Ionicons
                  name="checkmark-circle"
                  size={72}
                  color={Colors.emerald}
                />
              ) : (
                <Ionicons name="time" size={72} color={Colors.amber} />
              )}
            </View>

            <Text style={styles.title}>
              {order.status === "cancelled"
                ? "Payment Cancelled"
                : paid
                ? "Payment Received!"
                : "Confirming Payment…"}
            </Text>

            <Text style={styles.orderInfo}>
              {order.order_number} · {formatCurrency(order.total)}
            </Text>

            {(paid || (order.status !== "pending" && order.status !== "cancelled")) && (
              <Text style={styles.paidDate}>
                Paid on {formatDate(order.paid_at)}
              </Text>
            )}

            {!paid && order.status === "pending" && polls < MAX_POLLS && (
              <Text style={styles.statusHelper}>
                Waiting for payment gateway confirmation…
              </Text>
            )}

            {!paid && order.status === "pending" && polls >= MAX_POLLS && (
              <Text style={styles.statusHelper}>
                This is taking longer than usual. Check your order status anytime in My Orders.
              </Text>
            )}

            <View style={styles.btnGroup}>
              <Button
                variant="ghost"
                onPress={() => router.replace(`/orders/${order.id}` as any)}
                style={{ width: "100%" }}
              >
                View Order Details
              </Button>
              <Button
                onPress={() => router.replace("/(tabs)" as any)}
                style={{ width: "100%", marginTop: 8 }}
              >
                Continue Shopping
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.inkSoft,
    marginTop: 12,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 14,
    textAlign: "center",
  },
  content: {
    alignItems: "center",
    backgroundColor: Colors.paper,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.ink,
    textAlign: "center",
  },
  orderInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.inkSoft,
    marginTop: 6,
    textAlign: "center",
  },
  paidDate: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 4,
  },
  statusHelper: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 240,
  },
  btnGroup: {
    width: "100%",
    marginTop: 28,
  },
});
