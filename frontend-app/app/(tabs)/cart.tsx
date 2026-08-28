import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, resolveImageUrl } from "@/lib/utils";
import { Colors, FontFamily } from "@/constants/theme";
import type { CartItem } from "@/types";

export default function CartScreen() {
  const { user, loading: authLoading } = useAuth();
  const { items, count, setQty, remove } = useCart();
  const { push } = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      push("Please sign in to view your cart", "error");
    }
  }, [authLoading, user]);

  if (!authLoading && !user) {
    return <Redirect href="/auth/login" />;
  }

  if (authLoading) {
    return null;
  }

  const changeQty = async (item: CartItem, delta: number) => {
    if (delta > 0 && item.product && item.qty >= item.product.stock) {
      push(`Only ${item.product.stock} in stock`, "error");
      return;
    }
    setBusyId(item.id);
    try {
      await setQty(item.id, item.qty + delta);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to update quantity",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    setBusyId(item.id);
    try {
      await remove(item.id);
      push("Item removed from cart");
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to remove item",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.product?.price ?? 0) * it.qty,
    0
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.headerCount}>{count} items selected</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={60} color={Colors.inkSoft} />
          <Text style={styles.emptyTitle}>Your cart is still empty</Text>
          <Text style={styles.emptySub}>
            Start shopping for fresh groceries and delicious recipes.
          </Text>
          <Button
            variant="ghost"
            onPress={() => router.push("/(tabs)" as any)}
            style={{ marginTop: 16 }}
          >
            Explore Groceries
          </Button>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.listContent}>
            {items.map((it) => {
              const thumbnail = resolveImageUrl(it.product?.thumbnail);
              const unit =
                it.product?.uom?.name ?? it.product?.uom?.code ?? "pcs";

              return (
                <View key={it.id} style={styles.itemCard}>
                  {thumbnail ? (
                    <Image
                      source={{ uri: thumbnail }}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons
                        name="basket-outline"
                        size={24}
                        color={Colors.inkSoft}
                      />
                    </View>
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {it.product?.name ?? "Product"}
                    </Text>
                    <Text style={styles.itemUnit}>per {unit}</Text>

                    {/* Stepper */}
                    <View style={styles.stepperWrap}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        disabled={busyId === it.id}
                        onPress={() => changeQty(it, -1)}
                      >
                        <Text style={styles.stepperBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepperQty}>{it.qty}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        disabled={busyId === it.id}
                        onPress={() => changeQty(it, 1)}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <Text style={styles.itemTotal}>
                      {formatCurrency(
                        Number(it.product?.price ?? 0) * it.qty
                      )}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeItem(it)}
                      disabled={busyId === it.id}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Sticky Checkout Bottom Bar */}
          <View style={styles.checkoutBar}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            <Button
              onPress={() => router.push("/checkout" as any)}
              style={styles.checkoutBtn}
            >
              Checkout • {formatCurrency(subtotal)}
            </Button>
          </View>
        </>
      )}
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
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  headerCount: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colors.inkSoft,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
  },
  itemImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: Colors.ink,
  },
  itemUnit: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 2,
    marginBottom: 6,
  },
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.grayLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  stepperQty: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
    paddingHorizontal: 8,
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 58,
  },
  itemTotal: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: Colors.mossDark,
  },
  removeBtn: {
    paddingVertical: 2,
  },
  removeBtnText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: Colors.coral,
  },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: Colors.ink,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: Colors.mossDark,
  },
  checkoutBtn: {
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
