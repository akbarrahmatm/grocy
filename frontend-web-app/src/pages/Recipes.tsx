import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/App.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { SearchIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";
import { recipeApi } from "@/lib/api";
import type { Product } from "@/types";

const IDEAS = ["Rendang", "Nasi goreng", "Soto ayam", "Capcay"];

export default function Recipes() {
  const { user } = useAuth();
  const { items, count, add, setQty } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await recipeApi.suggest(q);
      setResults(res.products);
      setChecked(q);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze recipe"
      );
    } finally {
      setLoading(false);
    }
  };

  const qtyOf = (id: number) =>
    items.find((it) => it.product_id === id)?.qty ?? 0;

  const addToCart = async (id: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      navigate("/login");
      return;
    }
    const product = results.find((p) => p.id === id);
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

  const changeQty = async (id: number, delta: number) => {
    if (!user) {
      push("Sign in to add items to your cart", "error");
      navigate("/login");
      return;
    }
    const item = items.find((it) => it.product_id === id);
    if (!item) return;
    const product = results.find((p) => p.id === id);
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

  return (
    <div className="phone">
      <Header />

      <section className="ai-hero">
        <span className="hero-eyebrow">AI Recipe</span>
        <h1>
          What are we <em>cooking</em>?
        </h1>
        <p className="ai-sub">
          Tell us the dish. We&rsquo;ll find every ingredient you need.
        </p>

        <form
          className="search-bar ai-search"
          onSubmit={(e) => {
            e.preventDefault();
            check(query);
          }}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder="e.g. Rendang, Soto ayam..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Describe your recipe"
          />
          <button type="submit" className="search-go" disabled={loading}>
            {loading ? "Checking…" : "Check"}
          </button>
        </form>

        <div className="ai-chips">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              className="chip"
              onClick={() => {
                setQuery(idea);
                check(idea);
              }}
            >
              {idea}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p className="ai-status text-[var(--coral)]">{error}</p>
      ) : loading ? (
        <p className="ai-status">Analyzing &ldquo;{query.trim()}&rdquo;…</p>
      ) : checked ? (
        <>
          <div className="section-label">
            <h2>Ingredients for {checked}</h2>
            <span>{results.length} products</span>
          </div>
          {results.length ? (
            <div className="grid">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  qty={qtyOf(product.id)}
                  onAdd={addToCart}
                  onChangeQty={changeQty}
                />
              ))}
            </div>
          ) : (
            <p className="ai-status">No matches found for this recipe yet.</p>
          )}
        </>
      ) : (
        <p className="ai-status">
          Enter a dish above or pick an idea to get ingredient suggestions.
        </p>
      )}

      <BottomNav active="recipes" cartCount={count} />
    </div>
  );
}
