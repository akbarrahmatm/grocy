import { useEffect, useState } from "react";
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
import type { RecipeSuggestResponse } from "@/lib/api";
import type { RecipeHistory } from "@/types";

const IDEAS = ["Rendang", "Nasi goreng", "Soto ayam", "Capcay"];

export default function Recipes() {
  const { user } = useAuth();
  const { items, count, add, setQty } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState("");
  const [data, setData] = useState<RecipeSuggestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [histories, setHistories] = useState<RecipeHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const results: Product[] = data?.products ?? [];

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await recipeApi.history();
      setHistories(res.data);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const check = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;
    if (!user) {
      push("Please sign in to use AI Recipe", "error");
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await recipeApi.suggest(q);
      setData(res);
      setChecked(res.dish ?? q);
      fetchHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to analyze recipe";
      if (err instanceof Error && (err as unknown as { status?: number }).status === 401) {
        push("Session expired, please sign in again", "error");
        navigate("/login");
      }
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to load history", "error");
    }
  };

  const deleteHistory = async (id: number) => {
    try {
      await recipeApi.historyDelete(id);
      setHistories((prev) => prev.filter((h) => h.id !== id));
      push("History deleted");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  const qtyOf = (id: number) => items.find((it) => it.product_id === id)?.qty ?? 0;

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
      push(err instanceof Error ? err.message : "Failed to add to cart", "error");
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
      push(err instanceof Error ? err.message : "Failed to update quantity", "error");
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
        <p className="ai-sub">Tell us the dish. We&rsquo;ll find every ingredient you need.</p>

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

      {/* History */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">History</h3>
          {historyLoading && <span className="text-xs opacity-60">Loading…</span>}
        </div>
        {!user ? (
          <p className="text-xs opacity-60 mt-1">Sign in to see your recipe history.</p>
        ) : histories.length === 0 && !historyLoading ? (
          <p className="text-xs opacity-60 mt-1">No history yet.</p>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {histories.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white"
              >
                <button
                  onClick={() => openHistory(h.id)}
                  className="text-left flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{h.dish}</p>
                  <p className="text-[11px] opacity-60">
                    {new Date(h.created_at).toLocaleString()} • {h.total_items} items
                  </p>
                </button>
                <button
                  onClick={() => deleteHistory(h.id)}
                  className="ml-3 text-xs text-[var(--coral)] hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <p className="ai-status text-[var(--coral)]">{error}</p>
      ) : loading ? (
        <p className="ai-status">Analyzing &ldquo;{query.trim()}&rdquo;…</p>
      ) : checked && data ? (
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

          {data.recipe?.length ? (
            <div className="mt-6 px-4">
              <h3 className="font-semibold text-sm mb-2">Steps</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm opacity-80">
                {data.recipe.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {data.additional_items?.length ? (
            <div className="mt-4 px-4">
              <h3 className="font-semibold text-sm mb-1">Not in store</h3>
              <p className="text-xs opacity-60">
                {data.additional_items.map((a) => a.ingredient).join(", ")}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <p className="ai-status">Enter a dish above or pick an idea to get ingredient suggestions.</p>
      )}

      <BottomNav active="recipes" cartCount={count} />
    </div>
  );
}
