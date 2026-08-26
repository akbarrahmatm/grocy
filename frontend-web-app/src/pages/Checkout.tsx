import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { MapPin, Truck } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";
import { addressApi, isAuthenticated, orderApi, shippingApi } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import type { Address, ShippingRate } from "@/types";

const rateKey = (r: ShippingRate) => `${r.code}::${r.service}`;

// hidden until the Komship API key is activated
const SHOW_SHIPPING = false;

export default function Checkout() {
  const { push } = useToast();
  const { items } = useCart();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const ratesSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    addressApi
      .list()
      .then((res) => {
        if (cancelled) return;
        if (res.length === 0) {
          push("Add a delivery address first", "error");
          return;
        }
        setAddresses(res);
        selectAddress((res.find((a) => a.is_default) ?? res[0]).id);
      })
      .catch((err) =>
        push(
          err instanceof Error ? err.message : "Failed to load addresses",
          "error"
        )
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadRates(targetAddressId: number) {
    if (items.length === 0) return;
    const seq = ++ratesSeq.current;
    setRatesLoading(true);
    setRatesError(null);
    shippingApi
      .rates(
        targetAddressId,
        items.map((it) => ({ product_id: it.product_id, qty: it.qty }))
      )
      .then((res) => {
        if (seq !== ratesSeq.current) return;
        setRates(res.data);
        setSelectedRate(res.data[0] ? rateKey(res.data[0]) : null);
      })
      .catch((err) => {
        if (seq !== ratesSeq.current) return;
        setRates([]);
        setSelectedRate(null);
        setRatesError(
          err instanceof Error ? err.message : "Failed to fetch shipping rates"
        );
      })
      .finally(() => {
        if (seq === ratesSeq.current) setRatesLoading(false);
      });
  }

  function selectAddress(id: number) {
    setAddressId(id);
    if (!SHOW_SHIPPING) return;
    setRates([]);
    setSelectedRate(null);
    loadRates(id);
  }

  const selected = useMemo(
    () => rates.find((r) => rateKey(r) === selectedRate) ?? null,
    [rates, selectedRate]
  );

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.product?.price ?? 0) * it.qty,
    0
  );
  const total = subtotal + (selected?.price ?? 0);

  async function placeOrder() {
    if (!addressId || placing) return;
    setPlacing(true);
    try {
      const order = await orderApi.create({
        address_id: addressId,
        note: note.trim() || undefined,
        items: items.map((it) => ({ product_id: it.product_id, qty: it.qty })),
        ...(selected
          ? { courier: { code: selected.code, service: selected.service } }
          : {}),
      });
      window.location.assign(
        order.snap_redirect_url ?? `/orders/${order.id}/complete`
      );
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to place order",
        "error"
      );
      setPlacing(false);
    }
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (addresses !== null && addresses.length === 0) {
    return <Navigate to="/address" replace />;
  }
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const chosenAddress = addresses?.find((a) => a.id === addressId) ?? null;

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>Checkout</h2>
        <span>{items.length} products</span>
      </div>

      <section className="px-5 pt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
            <MapPin size={15} />
            Delivery address
          </h3>
          {addresses && addresses.length > 0 && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--paper)] text-[var(--moss-dark)] hover:border-[var(--moss)] transition-colors"
            >
              Pick address
            </button>
          )}
        </div>
        {!addresses ? (
          <p className="text-sm text-[var(--ink-soft)] py-3">Loading…</p>
        ) : chosenAddress ? (
          <div className="address-card w-full text-left border-[var(--moss)]">
            <span className="menu-icon" aria-hidden>
              <MapPin size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="address-top">
                <h3>{chosenAddress.label}</h3>
                {chosenAddress.is_default && (
                  <span className="badge">Default</span>
                )}
              </div>
              <p className="address-name">
                {chosenAddress.receiver_name} · {chosenAddress.phone}
              </p>
              <p className="address-line">
                {[
                  chosenAddress.address,
                  chosenAddress.city,
                  chosenAddress.province,
                  chosenAddress.postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {pickerOpen && addresses && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close address picker"
            className="absolute inset-0 bg-black/40"
            onClick={() => setPickerOpen(false)}
          />
          <div className="relative w-full max-w-[480px] max-h-[75vh] bg-[var(--paper)] rounded-t-2xl flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)] shrink-0">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                Pick delivery address
              </h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] px-2 py-1"
              >
                Close
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2"
              role="radiogroup"
              aria-label="Pick delivery address"
            >
              {addresses.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  role="radio"
                  aria-checked={addressId === a.id}
                  onClick={() => {
                    selectAddress(a.id);
                    setPickerOpen(false);
                  }}
                  className={cn(
                    "address-card w-full text-left cursor-pointer transition-colors",
                    addressId === a.id && "border-[var(--moss)]"
                  )}
                >
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
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {SHOW_SHIPPING && (
        <section className="px-5 pt-5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-[var(--ink)]">
            <Truck size={15} />
            Shipping method
          </h3>
          {chosenAddress && !chosenAddress.destination_id ? (
            <p className="text-sm text-[var(--coral)] py-2">
              This address has no delivery area. Edit it and pick one to see
              shipping rates.
            </p>
          ) : ratesLoading ? (
            <p className="text-sm text-[var(--ink-soft)] py-2">
              Checking rates…
            </p>
          ) : ratesError ? (
            <div className="py-2">
              <p className="text-sm text-[var(--coral)]">{ratesError}</p>
              <p className="text-xs text-[var(--ink-soft)] mt-1">
                You can still place the order without shipping and arrange
                delivery later.
              </p>
            </div>
          ) : rates.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)] py-2">
              Select an address.
            </p>
          ) : (
            <div
              className="space-y-2"
              role="radiogroup"
              aria-label="Shipping method"
            >
              {rates.map((r) => (
                <button
                  type="button"
                  key={rateKey(r)}
                  role="radio"
                  aria-checked={selectedRate === rateKey(r)}
                  disabled={placing}
                  onClick={() => setSelectedRate(rateKey(r))}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-[var(--paper)] text-left transition-colors",
                    selectedRate === rateKey(r)
                      ? "border-[var(--moss)]"
                      : "border-[var(--line)]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {r.company} · {r.service}
                    </p>
                    <p className="text-xs text-[var(--ink-soft)] truncate">
                      {[r.description, r.etd].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--moss-dark)] whitespace-nowrap">
                    {formatCurrency(r.price)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="px-5 pt-5">
        <label
          htmlFor="checkout-note"
          className="block text-sm font-medium mb-1.5 text-[var(--ink)]"
        >
          Note for courier (optional)
        </label>
        <textarea
          id="checkout-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="e.g. Leave at the front desk"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] focus:border-[var(--moss)] text-sm outline-none transition-colors bg-[var(--paper)] resize-none"
        />
      </section>

      <div className="summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {SHOW_SHIPPING && (
          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {selected ? formatCurrency(selected.price) : formatCurrency(0)}
            </span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="cta-wrap">
        <Button className="w-full" disabled={placing} onClick={placeOrder}>
          {placing
            ? "Placing order…"
            : `Place order • ${formatCurrency(total)}`}
        </Button>
      </div>

      <BottomNav
        active="cart"
        cartCount={items.reduce((s, it) => s + it.qty, 0)}
      />
    </div>
  );
}
