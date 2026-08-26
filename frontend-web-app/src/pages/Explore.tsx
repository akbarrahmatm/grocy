import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/App.css";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { categoryApi, productApi } from "@/lib/api";
import type { Category, Product } from "@/types";

const ALL = "All";

export default function Explore() {
  const { user } = useAuth();
  const { items, count, add, setQty } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 300);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  // fetch categories once for tabs
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

  // reset pagination when search or category changes
  useEffect(() => {
    pageRef.current = 1;
    setPage(1);
  }, [debouncedQuery, activeCategoryId]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productApi
      .list({
        page,
        search: debouncedQuery.trim() || undefined,
        category_id: activeCategoryId ?? undefined,
      })
      .then((res) => {
        if (cancelled) return;
        const active = res.data.filter((p) => p.is_active);
        setProducts((prev) => (page === 1 ? active : [...prev, ...active]));
        setHasMore(page < res.last_page);
        setTotal(res.total);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load products"
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, activeCategoryId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || error) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (loadingRef.current) return;
          const next = pageRef.current + 1;
          pageRef.current = next;
          setPage(next);
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, error, loading]);

  const handleSelectCategory = (name: string) => {
    if (name === ALL) {
      setActiveCategoryId(null);
      return;
    }
    const found = categories.find((c) => c.name === name);
    setActiveCategoryId(found ? found.id : null);
  };

  const toggleCart = async (id: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      navigate("/login");
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
      navigate("/login");
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

  const qtyOf = (id: number) =>
    items.find((it) => it.product_id === id)?.qty ?? 0;

  return (
    <div className="phone">
      <Header />
      <Hero query={query} onQueryChange={setQuery} />
      <CategoryTabs
        categories={Array.from(categoryNames)}
        active={activeCategoryName}
        onSelect={handleSelectCategory}
      />

      <div className="section-label">
        <h2>Fresh picks</h2>
        <span>{total} products</span>
      </div>

      {error ? (
        <p className="text-sm text-[var(--coral)] px-5">{error}</p>
      ) : loading && products.length === 0 ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ad-card animate-pulse">
              <div className="h-28 bg-[var(--line)] rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[var(--line)] rounded w-3/4" />
                <div className="h-3 bg-[var(--line)] rounded w-1/2" />
                <div className="h-6 bg-[var(--line)] rounded w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 && !loading ? (
        <p className="text-sm text-[var(--ink-soft)] px-5 py-8 text-center">
          No products found{debouncedQuery ? ` for "${debouncedQuery}"` : ""}.
        </p>
      ) : (
        <>
          <div className="grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                qty={qtyOf(product.id)}
                onAdd={toggleCart}
                onChangeQty={changeQty}
              />
            ))}
          </div>
          {hasMore && (
            <div
              ref={sentinelRef}
              className="py-4 text-center"
              style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}
            >
              {loading ? (
                <span className="text-xs text-[var(--ink-soft)]">Loading…</span>
              ) : (
                <span aria-hidden className="block h-1" />
              )}
            </div>
          )}
          {!hasMore && !loading && products.length > 0 && (
            <div
              aria-hidden
              className="shrink-0"
              style={{ height: "calc(72px + env(safe-area-inset-bottom))" }}
            />
          )}
        </>
      )}

      <BottomNav active="explore" cartCount={count} />
    </div>
  );
}
