// src/store/wishlistSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type WishlistItem = {
  id: number | string;
  slug?: string;
  name: string;

  // Numeric-style prices (from Woo fields)
  regularPrice?: string | null; // e.g. "35000"
  salePrice?: string | null; // e.g. "30000"
  onSale?: boolean;

  // HTML price (Woo price_html) for ranges / variable products
  priceHtml?: string | null;

  image?: string | null;
  rating?: number;
  reviews?: number;
};

export type WishlistState = {
  items: WishlistItem[];
};

export type WishlistStateFromStorage = {
  items: WishlistItem[];
};

const initialState: WishlistState = {
  items: [],
};

// Ensure consistent shape for stored items
const normalizeItem = (item: WishlistItem): WishlistItem => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  regularPrice: item.regularPrice ?? null,
  salePrice: item.salePrice ?? null,
  onSale: item.onSale ?? false,
  priceHtml: item.priceHtml ?? null,
  image: item.image ?? null,
  rating: item.rating ?? 0,
  reviews: item.reviews ?? 0,
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist(state, action: PayloadAction<WishlistStateFromStorage>) {
      state.items = Array.isArray(action.payload.items)
        ? action.payload.items.map(normalizeItem)
        : [];
    },

    addItem(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.some((i) => i.id === action.payload.id);
      if (!exists) {
        state.items.push(normalizeItem(action.payload));
      }
    },

    removeItem(state, action: PayloadAction<{ id: WishlistItem["id"] }>) {
      state.items = state.items.filter((i) => i.id !== action.payload.id);
    },

    toggleItem(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.some((i) => i.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      } else {
        state.items.push(normalizeItem(action.payload));
      }
    },

    clear(state) {
      state.items = [];
    },
  },
});

export const {
  hydrateWishlist,
  addItem: addWishlistItem,
  removeItem: removeWishlistItem,
  toggleItem: toggleWishlistItem,
  clear: clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

// Selectors
export const selectWishlistItems = (state: RootState) => state.wishlist.items;

export const selectIsInWishlist = (state: RootState, id: WishlistItem["id"]) =>
  state.wishlist.items.some((i) => i.id === id);

export const selectWishlistCount = (state: RootState) =>
  state.wishlist.items.length;
