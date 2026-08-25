import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { MapPin, Truck } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { isAuthenticated, orderApi } from "@/lib/api";
import { cn, formatCurrency, formatDate, statusClass } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { count } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !id) return;
    let cancelled = false;
    orderApi
      .show(Number(id))
      .then((res) => {
        if (!cancelled) {
          setOrder(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  function payNow(order: Order) {
    if (!order.snap_redirect_url) return;
    window.location.assign(order.snap_redirect_url);
  }

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>Order</h2>
        <span>{order?.order_number ?? "…"}</span>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ink-soft)] px-5 py-10 text-center">
          Loading order…
        </p>
      ) : error || !order ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-[var(--coral)] mb-4">
            {error ?? "Order not found"}
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="justify-center"
          >
            Back to orders
          </Button>
        </div>
      ) : (
        <>
          <div className="px-5 pt-2 flex items-center justify-between">
            <span className={cn(statusClass(order.status))}>
              {order.status}
            </span>
            <span className="text-xs text-[var(--ink-soft)]">
              {formatDate(order.created_at)}
            </span>
          </div>

          <section className="px-5 pt-5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-[var(--ink)]">
              <MapPin size={15} />
              Delivery
            </h3>
            <p className="text-sm font-semibold text-[var(--ink)]">
              {order.shipping_name} · {order.shipping_phone}
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              {[
                order.shipping_address,
                order.shipping_city,
                order.shipping_postal_code,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.courier_company && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--ink)]">
                <Truck size={14} />
                {order.courier_company} · {order.courier_service}
              </p>
            )}
          </section>

          {order.items && order.items.length > 0 && (
            <section className="px-5 pt-5">
              <h3 className="text-sm font-semibold mb-2 text-[var(--ink)]">
                Items
              </h3>
              <ul className="space-y-2">
                {order.items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm text-[var(--ink)] min-w-0 truncate">
                      {it.name}
                      <span className="text-[var(--ink-soft)]">
                        {" "}
                        × {it.qty}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-[var(--ink)] whitespace-nowrap">
                      {formatCurrency(it.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {order.note && (
            <section className="px-5 pt-5">
              <h3 className="text-sm font-semibold mb-1 text-[var(--ink)]">
                Note
              </h3>
              <p className="text-sm text-[var(--ink-soft)]">{order.note}</p>
            </section>
          )}

          <div className="summary mt-6">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            {order.paid_at && (
              <p className="text-xs text-[var(--ink-soft)] pt-2 text-right">
                Paid {formatDate(order.paid_at)}
              </p>
            )}
          </div>

          {order.status === "pending" && order.snap_redirect_url && (
            <div className="px-5 pt-5">
              <Button
                className="w-full justify-center"
                onClick={() => payNow(order)}
              >
                Pay now - {formatCurrency(order.total)}
              </Button>
            </div>
          )}

          <div className="cta-wrap">
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => navigate("/orders")}
            >
              Back to orders
            </Button>
          </div>
        </>
      )}

      <BottomNav active="profile" cartCount={count} />
    </div>
  );
}
