import { useMemo, useState } from "react";
import "@/App.css";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { productApi } from "@/lib/api";
import { useEffect } from "react";
import type { Product } from "@/types";

const ALL = "Semua";

export default function Explore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    productApi
      .list()
      .then((res) => {
        if (!cancelled) setProducts(res.data.filter((p) => p.is_active));
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Gagal memuat produk");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category?.name) set.add(p.category.name);
    }
    return [ALL, ...set];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === ALL || p.category?.name === activeCategory;
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, query, activeCategory]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCart = (id: number) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        <h2>Pilihan segar</h2>
        <span>{filtered.length} produk</span>
      </div>

      {error ? (
        <p className="text-sm text-[var(--coral)] px-5">{error}</p>
      ) : (
        <div className="grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFav={favorites.has(product.id)}
              onToggleFav={toggleFavorite}
              isAdded={cart.has(product.id)}
              onAdd={toggleCart}
            />
          ))}
        </div>
      )}

      <BottomNav active="explore" cartCount={cart.size} />
    </div>
  );
}