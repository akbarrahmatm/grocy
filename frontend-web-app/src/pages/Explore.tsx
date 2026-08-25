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
import { productApi } from "@/lib/api";
import type { Product } from "@/types";

const ALL = "All";

export default function Explore() {
  const { user } = useAuth();
  const { items, count, add, setQty } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    pageRef.current = 1;
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    productApi
      .list({ page, search: debouncedQuery.trim() || undefined })
      .then((res) => {
        if (cancelled) return;
        const active = res.data.filter((p) => p.is_active);
        setProducts((prev) => (page === 1 ? active : [...prev, ...active]));
        setHasMore(page < res.last_page);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load products"
          );
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || error) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const next = pageRef.current + 1;
          pageRef.current = next;
          setPage(next);
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, error]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category?.name) set.add(p.category.name);
    }
    return [ALL, ...set];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(
      (p) => activeCategory === ALL || p.category?.name === activeCategory
    );
  }, [products, activeCategory]);

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
        categories={Array.from(categories)}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="section-label">
        <h2>Fresh picks</h2>
        <span>{filtered.length} products</span>
      </div>

      {error ? (
        <p className="text-sm text-[var(--coral)] px-5">{error}</p>
      ) : (
        <>
          <div className="grid">
            {filtered.map((product) => (
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
            <div ref={sentinelRef} className="py-4 text-center">
              <span className="text-xs text-[var(--ink-soft)]">
                Loading more…
              </span>
            </div>
          )}
        </>
      )}

      <BottomNav active="explore" cartCount={count} />
    </div>
  );
}
