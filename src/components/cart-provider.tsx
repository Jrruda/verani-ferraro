"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { storeConfig } from "@/config/store";

export type ExecutiveSetSelection = {
  watchId: string;
  glassesId: string;
};

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  kind: "product" | "executive-set";
  details?: string;
  selection?: ExecutiveSetSelection;
  complimentaryItem?: {
    name: string;
    label: string;
    price: 0;
  };
};

type LegacyStoredCartItem = CartItem & {
  wixOptions?: Record<string, string>;
};

function normalizeStoredItems(items: LegacyStoredCartItem[]): CartItem[] {
  return items.map((item) => {
    const { wixOptions: _legacyWixOptions, ...cleanItem } = item;
    void _legacyWixOptions;

    if (cleanItem.kind !== "executive-set") return cleanItem;

    const [, legacyWatchId, legacyGlassesId] = cleanItem.id.split(":");
    const selection = cleanItem.selection ?? (legacyWatchId && legacyGlassesId
      ? { watchId: legacyWatchId, glassesId: legacyGlassesId }
      : undefined);

    return {
      ...cleanItem,
      selection,
      name: storeConfig.offer.name,
      price: storeConfig.offer.price,
      complimentaryItem: {
        name: "Case de óculos",
        label: storeConfig.executiveSet.includedGift.label,
        price: storeConfig.executiveSet.includedGift.price,
      },
    };
  });
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vf-cart-v2";
const LEGACY_STORAGE_KEY = "vf-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(normalizeStoredItems(JSON.parse(stored) as LegacyStoredCartItem[]));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const found = current.find((entry) => entry.id === item.id);
      if (found) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
        );
      }
      return [...current, { ...item, quantity }];
    });
    trackEvent("add_to_cart", { item_id: item.id, item_name: item.name, value: item.price });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((item) => item.id !== id));
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    drawerOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setDrawerOpen,
  }), [items, drawerOpen, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
