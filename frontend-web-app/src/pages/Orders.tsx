import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { isAuthenticated, orderApi } from "@/lib/api";
import { cn, formatCurrency, formatDate, statusClass } from "@/lib/utils";
import type { Order } from "@/types";

export default function Orders() {
  const navigate = useNavigate();
  const { count } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(() => isAuthenticated());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    let cancelled = false;
    orderApi
      .list({ page })
      .then((res) => {
        if (cancelled) return;
        setLastPage(res.last_page);
        setOrders((prev) =>
          page === 1 ? res.data : [...prev, ...res.data]
        );
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>My orders</h2>
        <span>
          {orders.length}
          {lastPage > 1 ? ` of page ${page}/${lastPage}` : ""}
        </span>
      </div>

      {loading && page === 1 ? (
        <p className="text-sm text-[var(--ink-soft)] px-5 py-10 text-center">
          Loading orders…
        </p>
      ) : error ? (
        <p className="text-sm text-[var(--coral)] px-5 py-10 text-center">{error}</p>
      ) : orders.length === 0 ? (
        <div className="empty-block">
          No orders yet.
          <br />
          Your grocery history will show up here.
        </div>
      ) : (
        <div className="menu px-5 pt-2">
          {orders.map((o) => (
            <button
              key={o.id}
              className="menu-item"
              onClick={() => navigate(`/orders/${o.id}`)}
            >
              <span className="menu-icon">
                <Package size={17} />
              </span>
              <span className="menu-text">
                <span className="t">{o.order_number}</span>
                <span className="s">
                  {formatDate(o.created_at)} · {formatCurrency(o.total)}
                  {typeof o.items_count === "number"
                    ? ` · ${o.items_count} item${o.items_count === 1 ? "" : "s"}`
                    : ""}
                </span>
              </span>
              <span className={cn("shrink-0", statusClass(o.status))}>{o.status}</span>
              <span className="menu-arrow">
                <ChevronRight size={15} />
              </span>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && page < lastPage && (
        <div className="px-5 pt-2">
          <Button variant="ghost" className="w-full justify-center" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}

      <BottomNav active="profile" cartCount={count} />
    </div>
  );
}
