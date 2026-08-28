import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { recipeApi } from "@/lib/api";
import { Colors } from "@/constants/theme";
import type { Product, RecipeSuggestResponse } from "@/types";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { items, add, setQty } = useCart();
  const { push } = useToast();

  const [data, setData] = useState<
    (RecipeSuggestResponse & { id: number; created_at: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    recipeApi
      .historyShow(Number(id))
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load recipe");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const qtyOf = (productId: number) =>
    items.find((it) => it.product_id === productId)?.qty ?? 0;

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      router.push("/auth/login" as any);
      return;
    }
    const product = data?.products?.find((p: Product) => p.id === productId);
    if (!product || product.stock <= 0) {
      push("Product is out of stock", "error");
      return;
    }
    try {
      await add(productId);
      push("Added to cart");
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to add to cart",
        "error"
      );
    }
  };

  const handleChangeQty = async (productId: number, delta: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      router.push("/auth/login" as any);
      return;
    }
    const item = items.find((it) => it.product_id === productId);
    if (!item) return;
    try {
      await setQty(item.id, item.qty + delta);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to update quantity",
        "error"
      );
    }
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
        <Text style={styles.headerTitle}>{data?.dish ?? "Recipe Detail"}</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.moss} />
        </View>
      ) : error || !data ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error ?? "Recipe not found"}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.dishHeader}>
            <Text style={styles.dishTitle}>{data.dish}</Text>
            <Text style={styles.dishDate}>
              Saved on{" "}
              {new Date(data.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          {/* Cooking Steps */}
          {data.recipe && data.recipe.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Cooking Steps</Text>
              {data.recipe.map((step: string, idx: number) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* In-Stock Groceries */}
          {data.products && data.products.length > 0 && (
            <View style={styles.sectionWrap}>
              <Text style={styles.cardHeading}>
                In-Stock Groceries ({data.products.length})
              </Text>
              <View style={styles.productsGrid}>
                {data.products.map((p: Product) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qty={qtyOf(p.id)}
                    onAdd={handleAddToCart}
                    onChangeQty={handleChangeQty}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Unavailable / Spices */}
          {data.unavailable_items && data.unavailable_items.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Additional Spices</Text>
              <View style={styles.tagsWrap}>
                {data.unavailable_items.map((item: { name: string; ingredient: string }, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {item.name || item.ingredient}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
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
    textTransform: "capitalize",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  },
  dishHeader: {
    marginBottom: 16,
  },
  dishTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.ink,
    textTransform: "capitalize",
  },
  dishDate: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.mossDark,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 19,
  },
  sectionWrap: {
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.grayLight,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  tagText: {
    fontSize: 12,
    color: Colors.inkSoft,
  },
});
