"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number; // effective unit price
  quantity: number;
  variant?: string;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number, open?: boolean) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQty: (productId: string, qty: number, variant?: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nour_cart_v1";

const keyOf = (id: string, variant?: string) => `${id}::${variant ?? ""}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1, open = true) => {
    setItems((prev) => {
      const k = keyOf(item.productId, item.variant);
      const existing = prev.find((i) => keyOf(i.productId, i.variant) === k);
      if (existing) {
        return prev.map((i) =>
          keyOf(i.productId, i.variant) === k
            ? { ...i, quantity: Math.min(i.quantity + qty, Math.max(i.stock, 1)) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(qty, Math.max(item.stock, 1)) }];
    });
    if (open) setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variant?: string) => {
    const k = keyOf(productId, variant);
    setItems((prev) => prev.filter((i) => keyOf(i.productId, i.variant) !== k));
  }, []);

  const updateQty = useCallback((productId: string, qty: number, variant?: string) => {
    const k = keyOf(productId, variant);
    setItems((prev) =>
      prev
        .map((i) =>
          keyOf(i.productId, i.variant) === k
            ? { ...i, quantity: Math.max(1, Math.min(qty, Math.max(i.stock, 1))) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      addItem,
      removeItem,
      updateQty,
      clear,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [items, isOpen, addItem, removeItem, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
