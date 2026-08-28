import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { categoryApi, productApi } from "@/lib/api";
import { Colors, FontFamily } from "@/constants/theme";
import type { Category, Product } from "@/types";

const ALL = "All";

export default function ExploreScreen() {
  const { user } = useAuth();
  const { items, add, setQty } = useCart();
  const { push } = useToast();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch categories once
  useEffect(() => {
    categoryApi
      .list()
      .then((res) => setCategories(res.data.filter((c) => c.is_active)))
      .catch(() => {});
  }, []);

  const activeCategoryName = useMemo(() => {
    if (activeCategoryId === null) return ALL;
    return categories.find((c) => c.id === activeCategoryId)?.name ?? ALL;
  }, [activeCategoryId, categories]);

  const categoryNames = useMemo(() => {
    return [ALL, ...categories.map((c) => c.name)];
  }, [categories]);

  // Reset pagination on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeCategoryId]);

  const loadProducts = useCallback(
    async (currentPage: number, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else if (currentPage === 1) setLoading(true);
      setError(null);

      try {
        const res = await productApi.list({
          page: currentPage,
          search: debouncedQuery.trim() || undefined,
          category_id: activeCategoryId ?? undefined,
        });

        const activeProducts = res.data.filter((p) => p.is_active);
        setProducts((prev) =>
          currentPage === 1 ? activeProducts : [...prev, ...activeProducts]
        );
        setHasMore(currentPage < res.last_page);
        setTotal(res.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedQuery, activeCategoryId]
  );

  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  const handleRefresh = () => {
    setPage(1);
    loadProducts(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSelectCategory = useCallback(
    (name: string) => {
      if (name === ALL) {
        setActiveCategoryId(null);
        return;
      }
      const found = categories.find((c) => c.name === name);
      setActiveCategoryId(found ? found.id : null);
    },
    [categories]
  );

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const qtyOf = (id: number) =>
    items.find((it) => it.product_id === id)?.qty ?? 0;

  const toggleCart = async (id: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      router.push("/auth/login" as any);
      return;
    }
    const product = products.find((p) => p.id === id);
    if (!product || product.stock <= 0) {
      push("Product is out of stock", "error");
      return;
    }
    if (qtyOf(id) >= product.stock) {
      push(`Only ${product.stock} in stock`, "error");
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

  const changeQty = async (id: number, delta: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      router.push("/auth/login" as any);
      return;
    }
    const item = items.find((it) => it.product_id === id);
    if (!item) return;
    const product = products.find((p) => p.id === id);
    if (delta > 0 && product && item.qty >= product.stock) {
      push(`Only ${product.stock} in stock`, "error");
      return;
    }
    try {
      await setQty(item.id, item.qty + delta);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to update quantity",
        "error"
      );
    }
  };

  const headerElement = useMemo(
    () => (
      <View>
        <Header />
        <Hero query="" onQueryChange={handleQueryChange} />
        <CategoryTabs
          categories={categoryNames}
          active={activeCategoryName}
          onSelect={handleSelectCategory}
        />
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionTitle}>Fresh picks</Text>
          <Text style={styles.sectionSub}>{total} products</Text>
        </View>
        {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
      </View>
    ),
    [categoryNames, activeCategoryName, total, error, handleQueryChange, handleSelectCategory]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={headerElement}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            qty={qtyOf(item.id)}
            onAdd={toggleCart}
            onChangeQty={changeQty}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.moss]}
            tintColor={Colors.moss}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.moss} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No products found{debouncedQuery ? ` for "${debouncedQuery}"` : ""}.
              </Text>
            </View>
          ) : loading && products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={Colors.moss} />
            </View>
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
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: Colors.inkSoft,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 13,
    fontFamily: FontFamily.medium,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.inkSoft,
    textAlign: "center",
  },
});
