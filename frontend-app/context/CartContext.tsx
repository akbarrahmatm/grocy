import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { cartApi } from "@/lib/api";
import type { CartItem } from "@/types";

interface CartCtx {
  items: CartItem[];
  count: number;
  isInCart: (productId: number) => boolean;
  add: (productId: number) => Promise<void>;
  setQty: (id: number, qty: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartCtx | null>(null);

const EMPTY: CartItem[] = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rawItems, setRawItems] = useState<CartItem[]>([]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setRawItems([]);
      return;
    }
    try {
      const res = await cartApi.list();
      setRawItems(res);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const items = user ? rawItems : EMPTY;

  const isInCart = useCallback(
    (productId: number) => items.some((it) => it.product_id === productId),
    [items]
  );

  const add = useCallback(async (productId: number) => {
    const item = await cartApi.add(productId);
    setRawItems((prev) => {
      const existing = prev.find((it) => it.id === item.id);
      if (existing) {
        return prev.map((it) =>
          it.id === item.id ? { ...it, qty: item.qty } : it
        );
      }
      return [item, ...prev];
    });
  }, []);

  const remove = useCallback(
    async (id: number) => {
      const snapshot = rawItems;
      setRawItems((prev) => prev.filter((it) => it.id !== id));
      try {
        await cartApi.remove(id);
      } catch (err) {
        setRawItems(snapshot);
        throw err;
      }
    },
    [rawItems]
  );

  const setQty = useCallback(
    async (id: number, qty: number) => {
      if (qty < 1) return remove(id);
      const snapshot = rawItems;
      setRawItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, qty } : it))
      );
      try {
        await cartApi.update(id, qty);
      } catch (err) {
        setRawItems(snapshot);
        throw err;
      }
    },
    [rawItems, remove]
  );

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((sum, it) => sum + it.qty, 0),
      isInCart,
      add,
      setQty,
      remove,
      refreshCart,
    }),
    [items, isInCart, add, setQty, remove, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
