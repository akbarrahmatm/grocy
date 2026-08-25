import {
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
}

const CartContext = createContext<CartCtx | null>(null);

const EMPTY: CartItem[] = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rawItems, setRawItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    cartApi
      .list()
      .then((res) => {
        if (!cancelled) setRawItems(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const items = user ? rawItems : EMPTY;

  const isInCart = useCallback(
    (productId: number) => items.some((it) => it.product_id === productId),
    [items]
  );

  const add = useCallback(async (productId: number) => {
    const item = await cartApi.add(productId);
    setRawItems((prev) => {
      const existing = prev.find((it) => it.id === item.id);
      if (existing)
        return prev.map((it) =>
          it.id === item.id ? { ...it, qty: item.qty } : it
        );
      return [item, ...prev];
    });
  }, []);

  const remove = useCallback(
    async (id: number) => {
      const snapshot = items;
      setRawItems((prev) => prev.filter((it) => it.id !== id));
      try {
        await cartApi.remove(id);
      } catch (err) {
        setRawItems(snapshot);
        throw err;
      }
    },
    [items]
  );

  const setQty = useCallback(
    async (id: number, qty: number) => {
      if (qty < 1) return remove(id);
      const snapshot = items;
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
    [items, remove]
  );

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((sum, it) => sum + it.qty, 0),
      isInCart,
      add,
      setQty,
      remove,
    }),
    [items, isInCart, add, setQty, remove]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
