"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import {
  EMPTY_CART,
  cartConflicts,
  cartCount,
  cartReducer,
  parseStoredCart,
  type CartState,
} from "@/lib/cart";

const STORAGE_KEY = "dabba.cart.v1";

interface CartContextValue {
  cart: CartState;
  count: number;
  add: (restaurantId: string, itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  /** True when adding from this restaurant would mix restaurants in one cart. */
  conflictsWith: (restaurantId: string) => boolean;
  /** Empties the cart and starts a new one with this item. */
  replaceWith: (restaurantId: string, itemId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      dispatch({ type: "hydrate", state: parseStoredCart(localStorage.getItem(STORAGE_KEY)) });
    } catch {
      /* storage unavailable: start empty */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore quota or privacy-mode errors */
    }
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cartCount(cart),
      add: (restaurantId, itemId) => dispatch({ type: "add", restaurantId, itemId }),
      setQty: (itemId, qty) => dispatch({ type: "setQty", itemId, qty }),
      remove: (itemId) => dispatch({ type: "remove", itemId }),
      clear: () => dispatch({ type: "clear" }),
      conflictsWith: (restaurantId) => cartConflicts(cart, restaurantId),
      replaceWith: (restaurantId, itemId) => {
        dispatch({ type: "clear" });
        dispatch({ type: "add", restaurantId, itemId });
      },
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
