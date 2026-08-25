import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { isAuthenticated, orderApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

const POLL_MS = 3000;
const MAX_POLLS = 13;

export default function OrderComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { count } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [polls, setPolls] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !id) return;
    let cancelled = false;
    orderApi
      .show(Number(id))
      .then((res) => {
        if (!cancelled) setOrder(res);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load order");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const pending = order !== null && order.status === "pending";

  useEffect(() => {
    if (!pending || polls >= MAX_POLLS || !id) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      orderApi
        .show(Number(id))
        .then((res) => {
          if (!cancelled) {
            setOrder(res);
            setPolls((p) => p + 1);
          }
        })
        .catch(() => {});
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pending, polls, id]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const paid = order !== null && order.paid_at !== null;

  return (
    <div className="phone flex flex-col items-center justify-center text-center px-8 min-h-screen">
      {!error && order === null ? (
        <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
      ) : error || !order ? (
        <>
          <p className="text-sm text-[var(--coral)] mb-4">
            {error ?? "Order not found"}
          </p>
          <Button variant="ghost" onClick={() => navigate("/orders")} className="justify-center">
            Back to orders
          </Button>
        </>
      ) : (
        <>
          {paid || order.status !== "pending" ? (
            <CheckCircle2 size={56} className="text-emerald-500" aria-hidden />
          ) : (
            <Clock size={56} className="text-amber-500" aria-hidden />
          )}
          <h1 className="text-2xl font-bold mt-4 text-[var(--ink)]">
            {order.status === "cancelled"
              ? "Payment failed"
              : paid
                ? "Payment received!"
                : "Confirming your payment…"}
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-2">
            {order.order_number}
            {" · "}
            {formatCurrency(order.total)}
          </p>
          {(paid || (order.status !== "pending" && order.status !== "cancelled")) && (
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              Paid {formatDate(order.paid_at)}
            </p>
          )}
          {!paid && order.status === "pending" && polls < MAX_POLLS && (
            <p className="text-xs text-[var(--ink-soft)] mt-3">
              Waiting for payment confirmation…
            </p>
          )}
          {!paid && order.status === "pending" && polls >= MAX_POLLS && (
            <p className="text-xs text-[var(--ink-soft)] mt-3 max-w-64">
              This is taking longer than usual. Check your order status later.
            </p>
          )}

          <div className="w-full space-y-2 pt-8">
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              View order details
            </Button>
            <Button className="w-full justify-center" onClick={() => navigate("/")}>
              Continue shopping
            </Button>
          </div>
        </>
      )}

      <BottomNav active="profile" cartCount={count} />
    </div>
  );
}
