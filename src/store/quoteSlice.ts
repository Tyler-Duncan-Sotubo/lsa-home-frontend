/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/quoteSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type QuoteItem = {
  slug: string;
  variantId?: string | null;
  name: string; // Product name (clean)
  variantLabel?: string; // e.g. "Size: Twin · Color: Blue"
  image?: string | null;
  quantity: number;
  attributes?: Record<string, string | null>;
  price?: number | null;
  productId?: string | null;
};

export type QuoteCustomer = {
  email: string;
  note?: string;
};

export type QuoteState = {
  items: QuoteItem[];
  isOpen: boolean;

  // 1 = add items / review, 2 = customer details
  step: 1 | 2;

  customer: QuoteCustomer;
};

export type QuoteStateFromStorage = {
  items: QuoteItem[];
  customer?: Partial<QuoteCustomer>;
};

function buildKey(slug: string, variantId?: string | null) {
  return `${slug}__${variantId ?? ""}`;
}

const initialState: QuoteState = {
  items: [],
  isOpen: false,
  step: 1,
  customer: {
    email: "",
    note: "",
  },
};

const quoteSlice = createSlice({
  name: "quote",
  initialState,
  reducers: {
    // optional localStorage hydration
    hydrateQuote(state, action: PayloadAction<QuoteStateFromStorage>) {
      state.items = Array.isArray(action.payload.items)
        ? action.payload.items
        : [];
      state.customer = {
        email: action.payload.customer?.email ?? "",
        note: action.payload.customer?.note ?? "",
      };
    },

    addToQuote(
      state,
      action: PayloadAction<{
        slug: string;
        variantId?: string | null;
        quantity?: number;
        variantLabel?: string;
        name: string;
        image?: string | null;
        productId?: string | null; // ✅ already in payload
        attributes?: Record<string, any>;
        price?: number | null;
      }>
    ) {
      const {
        slug,
        productId = null,
        variantId = null,
        variantLabel,
        quantity = 1,
        name,
        image = null,
        attributes,
        price = null,
      } = action.payload;

      const key = buildKey(slug, variantId);
      const index = state.items.findIndex(
        (it) => buildKey(it.slug, it.variantId) === key
      );

      if (index !== -1) {
        const existing = state.items[index];
        existing.quantity += quantity;
        existing.variantLabel = variantLabel;
        existing.name = name;
        existing.image = image;
        existing.attributes = attributes;
        existing.price = price;

        // ✅ NEW
        existing.productId = productId;

        // move to front (newest-first)
        state.items.splice(index, 1);
        state.items.unshift(existing);
      } else {
        state.items.unshift({
          slug,
          productId, // ✅ NEW
          variantId,
          variantLabel,
          quantity,
          name,
          image,
          attributes,
          price,
        });
      }

      state.isOpen = true;
      state.step = 1;
    },

    removeFromQuote(
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
      if (state.items.length === 0) state.step = 1;
    },

    updateQuoteQuantity(
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
      if (state.items.length === 0) state.step = 1;
    },

    clearQuote(state) {
      state.items = [];
      state.step = 1;
      state.customer = { email: "", note: "" };
    },

    openQuote(state) {
      state.isOpen = true;
    },

    closeQuote(state) {
      state.isOpen = false;
      state.step = 1;
    },

    goToStep(state, action: PayloadAction<1 | 2>) {
      // do not allow step 2 if no items
      if (action.payload === 2 && state.items.length === 0) return;
      state.step = action.payload;
    },

    nextStep(state) {
      if (state.items.length === 0) return;
      state.step = state.step === 1 ? 2 : 2;
    },

    prevStep(state) {
      state.step = state.step === 2 ? 1 : 1;
    },

    setCustomerEmail(state, action: PayloadAction<string>) {
      state.customer.email = action.payload;
    },

    setCustomerNote(state, action: PayloadAction<string>) {
      state.customer.note = action.payload;
    },
  },
});

export const {
  hydrateQuote,
  addToQuote,
  removeFromQuote,
  updateQuoteQuantity,
  clearQuote,
  openQuote,
  closeQuote,
  goToStep,
  nextStep,
  prevStep,
  setCustomerEmail,
  setCustomerNote,
} = quoteSlice.actions;

export default quoteSlice.reducer;

// selectors
export const selectQuoteItems = (state: RootState) => state.quote.items;
export const selectQuoteIsOpen = (state: RootState) => state.quote.isOpen;
export const selectQuoteStep = (state: RootState) => state.quote.step;
export const selectQuoteCustomer = (state: RootState) => state.quote.customer;

export const selectQuoteCount = (state: RootState) =>
  state.quote.items.reduce((sum, item) => sum + item.quantity, 0);
