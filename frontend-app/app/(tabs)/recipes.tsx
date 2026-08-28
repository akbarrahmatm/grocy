import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { recipeApi } from "@/lib/api";
import { Colors, FontFamily } from "@/constants/theme";
import type { Product, RecipeHistory, RecipeSuggestResponse } from "@/types";

const IDEAS = ["Rendang", "Nasi goreng", "Soto ayam", "Capcay"];

export default function RecipesScreen() {
  const { user, loading: authLoading } = useAuth();
  const { items, add, setQty } = useCart();
  const { push } = useToast();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState("");
  const [data, setData] = useState<RecipeSuggestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [histories, setHistories] = useState<RecipeHistory[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      push("Please sign in to access recipes", "error");
    }
  }, [authLoading, user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await recipeApi.history();
      setHistories(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // If unauthenticated, immediately redirect to login
  if (!authLoading && !user) {
    return <Redirect href="/auth/login" />;
  }

  if (authLoading) {
    return null;
  }

  const handleCheck = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await recipeApi.suggest(q);
      setData(res);
      setChecked(res.dish ?? q);
      fetchHistory();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to analyze recipe";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (id: number) => {
    try {
      const res = await recipeApi.historyShow(id);
      setData(res);
      setChecked(res.dish);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load history",
        "error"
      );
    }
  };

  const deleteHistory = (id: number) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await recipeApi.historyDelete(id);
            setHistories((prev) => prev.filter((h) => h.id !== id));
            push("History deleted");
          } catch (err) {
            push(
              err instanceof Error ? err.message : "Failed to delete",
              "error"
            );
          }
        },
      },
    ]);
  };

  const qtyOf = (id: number) =>
    items.find((it) => it.product_id === id)?.qty ?? 0;

  const handleAddToCart = async (id: number) => {
    const product = data?.products?.find((p: Product) => p.id === id);
    if (!product || product.stock <= 0) {
      push("Product is out of stock", "error");
      return;
    }
    try {
      await add(id);
      push("Added to cart");
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to add to cart",
        "error"
      );
    }
  };

  const handleChangeQty = async (id: number, delta: number) => {
    const item = items.find((it) => it.product_id === id);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        <View style={styles.headerTitleWrap}>
          <Text style={styles.screenTitle}>AI Recipe Studio</Text>
          <Text style={styles.screenSubtitle}>
            Enter any dish and Grocy AI will generate the recipe and match available ingredients.
          </Text>
        </View>

        {/* Input box */}
        <View style={styles.inputCard}>
          <View style={styles.inputWrap}>
            <Ionicons name="sparkles" size={18} color={Colors.mossDark} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Nasi Goreng Spesial, Sop Buntut..."
              placeholderTextColor={Colors.inkSoft}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleCheck(query)}
            />
          </View>

          {/* Idea chips */}
          <View style={styles.ideasWrap}>
            {IDEAS.map((idea) => (
              <TouchableOpacity
                key={idea}
                style={styles.ideaChip}
                onPress={() => {
                  setQuery(idea);
                  handleCheck(idea);
                }}
              >
                <Text style={styles.ideaChipText}>{idea}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            loading={loading}
            disabled={!query.trim()}
            onPress={() => handleCheck(query)}
            style={{ marginTop: 12 }}
          >
            Generate Recipe &amp; Match Stock
          </Button>
        </View>

        {Boolean(error) && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Generated Recipe Result */}
        {data && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.dishName}>{checked || data.dish}</Text>
              <Text style={styles.dishMeta}>
                {data.available_items?.length ?? 0} ingredients ready in store
              </Text>
            </View>

            {/* Recipe Steps */}
            {data.recipe && data.recipe.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Cooking Steps</Text>
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

            {/* Available Ingredients */}
            {data.products && data.products.length > 0 && (
              <View style={styles.sectionWrap}>
                <Text style={styles.sectionHeading}>
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

            {/* Missing or additional items */}
            {data.unavailable_items && data.unavailable_items.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>
                  Additional / Pantry Spices
                </Text>
                <View style={styles.tagsWrap}>
                  {data.unavailable_items.map((item: { name: string; ingredient: string }, idx: number) => (
                    <View key={idx} style={styles.unavailTag}>
                      <Text style={styles.unavailTagText}>
                        {item.name || item.ingredient}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* History Section */}
        {histories.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyHeading}>Saved Recipe History</Text>
            {histories.map((h) => (
              <View key={h.id} style={styles.historyCard}>
                <TouchableOpacity
                  style={styles.historyInfo}
                  onPress={() => openHistory(h.id)}
                >
                  <Text style={styles.historyDish}>{h.dish}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(h.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteHistory(h.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.coral} />
                </TouchableOpacity>
              </View>
            ))}
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
    paddingBottom: 40,
  },
  headerTitleWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  screenSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 4,
    lineHeight: 18,
  },
  inputCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.paper,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.grayLight,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.ink,
  },
  ideasWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  ideaChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.lavender,
  },
  ideaChipText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: Colors.mossDark,
  },
  errorCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.redLight,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  resultContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  resultHeader: {
    marginBottom: 16,
  },
  dishName: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
    textTransform: "capitalize",
  },
  dishMeta: {
    fontSize: 13,
    fontFamily: FontFamily.semiBold,
    color: Colors.mossDark,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 16,
  },
  sectionWrap: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
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
    fontFamily: FontFamily.bold,
    color: Colors.mossDark,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.ink,
    lineHeight: 19,
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
  unavailTag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.grayLight,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  unavailTagText: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
  },
  historyContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  historyHeading: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
    marginBottom: 10,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyDish: {
    fontSize: 14,
    fontFamily: FontFamily.semiBold,
    color: Colors.ink,
  },
  historyDate: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
});
