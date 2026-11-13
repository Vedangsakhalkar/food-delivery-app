/** Pure cart logic. The cart only stores ids and quantities; prices always come from the server. */
export const MAX_QTY = 20;

export interface CartLine {
  itemId: string;
  qty: number;
}

export interface CartState {
  restaurantId: string | null;
  lines: CartLine[];
}

export const EMPTY_CART: CartState = { restaurantId: null, lines: [] };

export type CartAction =
  | { type: "add"; restaurantId: string; itemId: string }
  | { type: "setQty"; itemId: string; qty: number }
  | { type: "remove"; itemId: string }
  | { type: "clear" }
  | { type: "hydrate"; state: CartState };

const clamp = (qty: number) => Math.min(MAX_QTY, Math.max(0, Math.floor(qty)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "clear":
      return EMPTY_CART;
    case "add": {
      // A cart holds one restaurant. Callers check cartConflicts() first and clear on confirm.
      if (state.restaurantId && state.restaurantId !== action.restaurantId) return state;
      const existing = state.lines.find((l) => l.itemId === action.itemId);
      const lines = existing
        ? state.lines.map((l) => (l.itemId === action.itemId ? { ...l, qty: clamp(l.qty + 1) } : l))
        : [...state.lines, { itemId: action.itemId, qty: 1 }];
      return { restaurantId: action.restaurantId, lines };
    }
    case "setQty": {
      const qty = clamp(action.qty);
      const lines =
        qty === 0
          ? state.lines.filter((l) => l.itemId !== action.itemId)
          : state.lines.map((l) => (l.itemId === action.itemId ? { ...l, qty } : l));
      return lines.length ? { ...state, lines } : EMPTY_CART;
    }
    case "remove": {
      const lines = state.lines.filter((l) => l.itemId !== action.itemId);
      return lines.length ? { ...state, lines } : EMPTY_CART;
    }
  }
}

export const cartCount = (state: CartState) => state.lines.reduce((n, l) => n + l.qty, 0);

/** True when adding from `restaurantId` would mix restaurants. */
export const cartConflicts = (state: CartState, restaurantId: string) =>
  state.lines.length > 0 && state.restaurantId !== restaurantId;

/** Validates whatever was in localStorage; anything unexpected becomes an empty cart. */
export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return EMPTY_CART;
  try {
    const v = JSON.parse(raw) as CartState;
    if (typeof v?.restaurantId !== "string" || !Array.isArray(v.lines)) return EMPTY_CART;
    const lines = v.lines
      .filter((l) => typeof l?.itemId === "string" && Number.isInteger(l.qty) && l.qty > 0)
      .map((l) => ({ itemId: l.itemId, qty: clamp(l.qty) }));
    return lines.length ? { restaurantId: v.restaurantId, lines } : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}
