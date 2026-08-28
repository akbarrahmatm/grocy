import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { orderApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusStyle } from "@/lib/utils";
import { Colors } from "@/constants/theme";
import type { Order } from "@/types";

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (currentPage: number, isRefresh = false) => {
      if (!user) return;
      if (isRefresh) setRefreshing(true);
      else if (currentPage === 1) setLoading(true);
      setError(null);

      try {
        const res = await orderApi.list({ page: currentPage });
        setLastPage(res.last_page);
        setTotal(res.total);
        setOrders((prev) =>
          currentPage === 1 ? res.data : [...prev, ...res.data]
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load orders"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadOrders(page);
  }, [page, loadOrders]);

  const handleRefresh = () => {
    setPage(1);
    loadOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && page < lastPage) {
      setPage((prev) => prev + 1);
    }
  };

  if (!user) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.authPromptContainer}>
          <Ionicons name="receipt-outline" size={64} color={Colors.inkSoft} />
          <Text style={styles.authPromptTitle}>Sign in to view orders</Text>
          <Text style={styles.authPromptSub}>
            Track your grocery orders, courier deliveries, and payment receipts.
          </Text>
          <Button
            onPress={() => router.push("/auth/login" as any)}
            style={{ width: 200, marginTop: 16 }}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerCount}>{total} orders</Text>
      </View>

      {Boolean(error) && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.moss]}
            tintColor={Colors.moss}
          />
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.orderCard}
              onPress={() => router.push(`/orders/${item.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.orderNumberWrap}>
                  <Ionicons
                    name="cube-outline"
                    size={16}
                    color={Colors.mossDark}
                  />
                  <Text style={styles.orderNumber}>{item.order_number}</Text>
                </View>
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
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.dateText}>
                  {formatDate(item.created_at)}
                </Text>
                <Text style={styles.totalText}>
                  {formatCurrency(item.total)}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.itemsCount}>
                  {item.items_count ?? item.items?.length ?? 1} items
                </Text>
                <View style={styles.viewDetailLink}>
                  <Text style={styles.viewDetailText}>View details</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={Colors.mossDark}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="receipt-outline"
                size={54}
                color={Colors.inkSoft}
              />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySub}>
                Your grocery purchases will appear here.
              </Text>
            </View>
          ) : loading && orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={Colors.moss} />
            </View>
          ) : null
        }
        ListFooterComponent={
          page < lastPage ? (
            <TouchableOpacity
              onPress={handleLoadMore}
              style={styles.loadMoreBtn}
            >
              <Text style={styles.loadMoreText}>Load more orders</Text>
            </TouchableOpacity>
          ) : null
        }
      />
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
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.ink,
  },
  headerCount: {
    fontSize: 13,
    color: Colors.inkSoft,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderNumberWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.line,
    marginVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.inkSoft,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.mossDark,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemsCount: {
    fontSize: 12,
    color: Colors.inkSoft,
  },
  viewDetailLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mossDark,
  },
  loadMoreBtn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.ink,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 8,
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
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.ink,
    marginTop: 16,
  },
  authPromptSub: {
    fontSize: 13,
    color: Colors.inkSoft,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
