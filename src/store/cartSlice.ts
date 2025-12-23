/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type CartItem = {
  slug: string;
  variantId?: string | null;

  // ✅ UI fields
  name: string;
  image?: string | null;
  unitPrice: number;

  quantity: number;

  // optional
  priceHtml?: string | null;
  attributes?: Record<string, string | null>;
  weightKg?: number;
};

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

export type CartStateFromStorage = {
  items: CartItem[];
};

function buildKey(slug: string, variantId?: string | null) {
  return `${slug}__${variantId ?? ""}`;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ✅ keep this for localStorage hydration
    hydrateCart(state, action: PayloadAction<CartStateFromStorage>) {
      state.items = Array.isArray(action.payload.items)
        ? action.payload.items
        : [];
    },

    addToCart(
      state,
      action: PayloadAction<{
        slug: string;
        variantId?: string | null;
        quantity?: number;

        name: string;
        image?: string | null;
        unitPrice: number;

        priceHtml?: string | null;
        attributes?: Record<string, any>;
        weightKg?: number;
      }>
    ) {
      const {
        slug,
        variantId = null,
        quantity = 1,
        name,
        image = null,
        unitPrice,
        priceHtml = null,
        attributes,
        weightKg,
      } = action.payload;

      const key = buildKey(slug, variantId);
      const index = state.items.findIndex(
        (it) => buildKey(it.slug, it.variantId) === key
      );

      if (index !== -1) {
        // ✅ update existing
        const existing = state.items[index];
        existing.quantity += quantity;

        existing.name = name;
        existing.image = image;
        existing.unitPrice = unitPrice;
        existing.priceHtml = priceHtml;
        existing.attributes = attributes;
        existing.weightKg = weightKg;

        // ✅ move to front (newest-first)
        state.items.splice(index, 1);
        state.items.unshift(existing);
      } else {
        // ✅ insert at front (not push)
        state.items.unshift({
          slug,
          variantId,
          quantity,
          name,
          image,
          unitPrice,
          priceHtml,
          attributes,
          weightKg,
        });
      }

      state.isOpen = true;
    },

    removeFromCart(
      state,
      action: PayloadAction<{ slug: string; variantId?: string | null }>
    ) {
      const key = buildKey(
        action.payload.slug,
        action.payload.variantId ?? null
      );
      state.items = state.items.filter(
        (it) => buildKey(it.slug, it.variantId) !== key
      );
    },

    updateCartQuantity(
      state,
      action: PayloadAction<{
        slug: string;
        variantId?: string | null;
        quantity: number;
      }>
    ) {
      const { slug, variantId = null, quantity } = action.payload;
      const key = buildKey(slug, variantId);

      const existing = state.items.find(
        (it) => buildKey(it.slug, it.variantId) === key
      );
      if (!existing) return;

      if (quantity <= 0) {
        state.items = state.items.filter(
          (it) => buildKey(it.slug, it.variantId) !== key
        );
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
  hydrateCart, // ✅ exported
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
