// src/store/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type CartItem = {
  id: number | string; // Woo product / variation id
  slug?: string;
  name: string;
  image?: string | null;
  unitPrice: number; // numeric price for totals
  priceHtml?: string | null; // optional formatted price
  quantity: number;
  attributes?: Record<string, string | null>; // e.g. { size: "L", color: "White" }

  /** Per-unit weight in kilograms, from WooCommerce product data */
  weightKg?: number;
};

export type CartState = {
  items: CartItem[];
  isOpen: boolean; // controls cart drawer UI
};

export type CartStateFromStorage = {
  items: CartItem[];
};

// helper: stable key per item+attributes
function buildItemKey(item: Pick<CartItem, "id" | "attributes">): string {
  const attrs = item.attributes || {};
  const sortedKeys = Object.keys(attrs).sort();
  const attrsString = sortedKeys.map((k) => `${k}:${attrs[k] ?? ""}`).join("|");
  return `${item.id}__${attrsString}`;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // hydrating only items (not isOpen) from localStorage
    hydrateCart(state, action: PayloadAction<CartStateFromStorage>) {
      state.items = Array.isArray(action.payload.items)
        ? action.payload.items
        : [];
    },

    addToCart(
      state,
      action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>
    ) {
      const { quantity = 1, ...rest } = action.payload;

      const key = buildItemKey({
        id: rest.id,
        attributes: rest.attributes,
      });

      const existing = state.items.find((item) => buildItemKey(item) === key);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          ...rest,
          quantity,
          image: rest.image ?? null,
          priceHtml: rest.priceHtml ?? null,
        });
      }

      // auto-open drawer whenever cart is modified via add
      state.isOpen = true;
    },

    removeFromCart(
      state,
      action: PayloadAction<{
        id: CartItem["id"];
        attributes?: Record<string, string | null>;
      }>
    ) {
      const keyToRemove = buildItemKey({
        id: action.payload.id,
        attributes: action.payload.attributes,
      });

      state.items = state.items.filter(
        (item) => buildItemKey(item) !== keyToRemove
      );
    },

    updateCartQuantity(
      state,
      action: PayloadAction<{
        id: CartItem["id"];
        attributes?: Record<string, string | null>;
        quantity: number;
      }>
    ) {
      const { id, attributes, quantity } = action.payload;
      const key = buildItemKey({ id, attributes });

      const existing = state.items.find((item) => buildItemKey(item) === key);

      if (!existing) return;

      if (quantity <= 0) {
        state.items = state.items.filter((item) => buildItemKey(item) !== key);
      } else {
        existing.quantity = quantity;
      }
    },

    clearCart(state) {
      state.items = [];
    },

    openCart(state) {
      state.isOpen = true;
    },

    closeCart(state) {
      state.isOpen = false;
    },

    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// selectors
export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

export const selectCartTotalWeightKg = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + (item.weightKg ?? 0) * item.quantity,
    0
  );

export const selectCartIsOpen = (state: RootState) => state.cart.isOpen;
