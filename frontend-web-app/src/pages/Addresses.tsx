import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";
import { addressApi, isAuthenticated } from "@/lib/api";
import type { Address } from "@/types";

export default function Addresses() {
  const { push } = useToast();
  const navigate = useNavigate();
  const { count } = useCart();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(() => isAuthenticated());
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    let cancelled = false;
    addressApi
      .list()
      .then((res) => {
        if (!cancelled) setItems(res);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load addresses");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function removeItem(a: Address) {
    setDeletingId(a.id);
    const snapshot = items;
    setItems((prev) => prev.filter((it) => it.id !== a.id));
    try {
      await addressApi.remove(a.id);
      push("Address deleted");
    } catch (err) {
      setItems(snapshot);
      push(err instanceof Error ? err.message : "Failed to delete address", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>Address</h2>
        <span>{items.length} saved</span>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ink-soft)] px-5 py-10 text-center">
          Loading addresses…
        </p>
      ) : error ? (
        <p className="text-sm text-[var(--coral)] px-5 py-10 text-center">{error}</p>
      ) : items.length === 0 ? (
        <div className="empty-block">No saved addresses yet.</div>
      ) : (
        <div className="address-list">
          {items.map((a) => (
            <div className="address-card" key={a.id}>
              <span className="menu-icon" aria-hidden>
                <MapPin size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="address-top">
                  <h3>{a.label}</h3>
                  {a.is_default && <span className="badge">Default</span>}
                </div>
                <p className="address-name">
                  {a.receiver_name} · {a.phone}
                </p>
                <p className="address-line">
                  {[a.address, a.city, a.province, a.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="address-actions">
                <button
                  onClick={() => navigate(`/address/edit/${a.id}`)}
                  disabled={deletingId === a.id}
                  aria-label={`Edit ${a.label}`}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => removeItem(a)}
                  disabled={deletingId === a.id}
                  aria-label={`Delete ${a.label}`}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="cta-wrap" style={{ paddingTop: 0 }}>
          <Button className="w-full" onClick={() => navigate("/address/new")}>
            <Plus size={16} />
            Add address
          </Button>
        </div>
      )}

      <BottomNav active="profile" cartCount={count} />
    </div>
  );
}
