import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";
import { isAuthenticated } from "@/lib/api";
import { formatCurrency, resolveImageUrl } from "@/lib/utils";
import type { CartItem } from "@/types";

export default function Cart() {
  const { push } = useToast();
  const { items, count, setQty, remove } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<number | null>(null);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  async function changeQty(item: CartItem, delta: number) {
    if (delta > 0 && item.product && item.qty >= item.product.stock) {
      push(`Only ${item.product.stock} in stock`, "error");
      return;
    }
    setBusyId(item.id);
    try {
      await setQty(item.id, item.qty + delta);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to update quantity", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(item: CartItem) {
    setBusyId(item.id);
    try {
      await remove(item.id);
      push("Item removed from cart");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to remove item", "error");
    } finally {
      setBusyId(null);
    }
  }

  function handleCheckout() {
    navigate("/checkout");
  }

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.product?.price ?? 0) * it.qty,
    0
  );

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>Cart</h2>
        <span>{count} products selected</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-block">
          Your cart is still empty.
          <br />
          Start shopping for fresh groceries.
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((it) => (
              <div className="cart-item" key={it.id}>
                {resolveImageUrl(it.product?.thumbnail) ? (
                  <img
                    className="cart-img"
                    src={resolveImageUrl(it.product?.thumbnail) ?? ""}
                    alt={it.product?.name ?? "Product"}
                    loading="lazy"
                  />
                ) : (
                  <div className="cart-img media-placeholder">
                    {it.product?.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div className="cart-info">
                  <h3>{it.product?.name ?? "Product"}</h3>
                  <p className="cart-unit">
                    per {it.product?.uom?.name ?? it.product?.uom?.code ?? "pcs"}
                  </p>
                  <div className="qty">
                    <button
                      onClick={() => changeQty(it, -1)}
                      disabled={busyId === it.id}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{it.qty}</span>
                    <button
                      onClick={() => changeQty(it, 1)}
                      disabled={busyId === it.id}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-right">
                  <span className="cart-price">
                    {formatCurrency(Number(it.product?.price ?? 0) * it.qty)}
                  </span>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(it)}
                    disabled={busyId === it.id}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary">
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="cta-wrap">
            <Button className="w-full" disabled={items.length === 0} onClick={handleCheckout}>
              {items.length === 0
                ? "Cart is empty"
                : `Checkout • ${formatCurrency(subtotal)}`}
            </Button>
          </div>
        </>
      )}

      <BottomNav active="cart" cartCount={count} />
    </div>
  );
}
