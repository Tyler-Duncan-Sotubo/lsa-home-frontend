// src/store/recentlyViewedSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type RecentlyViewedItem = {
  id: number | string;
  slug?: string;
  name: string;

  // Numeric-style prices
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean;

  // HTML price (Woo price_html) for ranges / variable products
  priceHtml?: string | null;

  averageRating?: number;
  ratingCount?: number | null;

  image?: string | null;
  viewedAt: number;
};

export type RecentlyViewedState = {
  items: RecentlyViewedItem[];
};

export type RecentlyViewedStateFromStorage = {
  items: RecentlyViewedItem[];
};

const initialState: RecentlyViewedState = {
  items: [],
};

const normalizeItem = (
  item: Omit<RecentlyViewedItem, "viewedAt">
): RecentlyViewedItem => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  regularPrice: item.regularPrice ?? null,
  salePrice: item.salePrice ?? null,
  onSale: item.onSale ?? false,
  priceHtml: item.priceHtml ?? null,
  image: item.image ?? null,
  averageRating: item.averageRating,
  ratingCount: item.ratingCount ?? null,
  viewedAt: Date.now(),
});

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState,
  reducers: {
    hydrateRecentlyViewed(
      state,
      action: PayloadAction<RecentlyViewedStateFromStorage>
    ) {
      state.items = Array.isArray(action.payload.items)
        ? action.payload.items.map((item) =>
            normalizeItem({
              id: item.id,
              slug: item.slug,
              name: item.name,
              regularPrice: item.regularPrice,
              salePrice: item.salePrice,
              onSale: item.onSale,
              priceHtml: item.priceHtml,
              image: item.image,
            })
          )
        : [];
    },

    addRecentlyViewed(
      state,
      action: PayloadAction<Omit<RecentlyViewedItem, "viewedAt">>
    ) {
      const payload = normalizeItem(action.payload);

      // Remove duplicate by slug or ID
      const filtered = state.items.filter((i) => {
        if (payload.slug && i.slug) return i.slug !== payload.slug;
        return i.id !== payload.id;
      });

      // Add to front, cap at 20
      state.items = [payload, ...filtered].slice(0, 20);
    },

    clearRecentlyViewed(state) {
      state.items = [];
    },
  },
});

export const { hydrateRecentlyViewed, addRecentlyViewed, clearRecentlyViewed } =
  recentlyViewedSlice.actions;

export default recentlyViewedSlice.reducer;

// Selector
export const selectRecentlyViewedItems = (state: RootState) =>
  state.recentlyViewed.items;
