import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Button from "@/components/ui/Button";
import { orderApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusStyle } from "@/lib/utils";
import { Colors } from "@/constants/theme";
import type { Order } from "@/types";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payModalVisible, setPayModalVisible] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.show(Number(id));
      setOrder(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.moss} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error ?? "Order not found"}</Text>
          <Button
            variant="ghost"
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          >
            Back to Orders
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(order.status);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{order.order_number}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Bar */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.bg },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: statusStyle.text },
              ]}
            >
              {order.status}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
        </View>

        {/* Delivery Info */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.mossDark}
            />
            <Text style={styles.cardTitle}>Delivery Information</Text>
          </View>
          <Text style={styles.receiverText}>
            {order.shipping_name} · {order.shipping_phone}
          </Text>
          <Text style={styles.addressText}>
            {[
              order.shipping_address,
              order.shipping_city,
              order.shipping_postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
          </Text>
          {order.courier_company && (
            <View style={styles.courierRow}>
              <Ionicons name="car-outline" size={16} color={Colors.mossDark} />
              <Text style={styles.courierText}>
                {order.courier_company} · {order.courier_service}
                {order.airway_bill ? ` (${order.airway_bill})` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Items List */}
        {order.items && order.items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Purchased Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.name}{" "}
                  <Text style={styles.itemQty}>× {item.qty}</Text>
                </Text>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Note */}
        {order.note && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.noteText}>{order.note}</Text>
          </View>
        )}

        {/* Summary Breakdown */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Cost</Text>
            <Text style={styles.summaryVal}>
              {formatCurrency(order.shipping_cost)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.total)}</Text>
          </View>
          {order.paid_at && (
            <Text style={styles.paidDate}>
              Paid on {formatDate(order.paid_at)}
            </Text>
          )}
        </View>

        {/* Pay Now button if pending */}
        {order.status === "pending" && order.snap_redirect_url && (
          <Button
            onPress={() => setPayModalVisible(true)}
            style={{ marginTop: 10 }}
          >
            Pay Now • {formatCurrency(order.total)}
          </Button>
        )}

        <Button
          variant="ghost"
          onPress={() => router.replace("/(tabs)/orders" as any)}
          style={{ marginTop: 10 }}
        >
          Back to Orders
        </Button>
      </ScrollView>

      {/* Midtrans Snap WebView Modal */}
      <Modal
        visible={payModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setPayModalVisible(false);
          fetchOrder();
        }}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <View style={styles.webHeader}>
            <Text style={styles.webTitle}>Payment Confirmation</Text>
            <TouchableOpacity
              onPress={() => {
                setPayModalVisible(false);
                fetchOrder();
              }}
              style={styles.closeWebBtn}
            >
              <Ionicons name="close" size={24} color={Colors.ink} />
            </TouchableOpacity>
          </View>
          {order.snap_redirect_url && (
            <WebView
              source={{ uri: order.snap_redirect_url }}
              onNavigationStateChange={(navState) => {
                if (navState.url.includes("finish") || navState.url.includes("complete") || navState.url.includes("status_code=200")) {
                  setPayModalVisible(false);
                  fetchOrder();
                }
              }}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webLoader}>
                  <ActivityIndicator size="large" color={Colors.moss} />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dateText: {
    fontSize: 12,
    color: Colors.inkSoft,
  },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 6,
  },
  receiverText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.ink,
  },
  addressText: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 2,
    lineHeight: 16,
  },
  courierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  courierText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.ink,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  itemName: {
    fontSize: 13,
    color: Colors.ink,
    flex: 1,
    marginRight: 8,
  },
  itemQty: {
    color: Colors.inkSoft,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.ink,
  },
  noteText: {
    fontSize: 13,
    color: Colors.inkSoft,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.inkSoft,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.ink,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.ink,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.mossDark,
  },
  paidDate: {
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 6,
    textAlign: "right",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 14,
    textAlign: "center",
  },
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  webTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.ink,
  },
  closeWebBtn: {
    padding: 4,
  },
  webLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
