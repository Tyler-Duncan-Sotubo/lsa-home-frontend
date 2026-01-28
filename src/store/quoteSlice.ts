/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/quoteSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type QuoteItem = {
  slug: string;
  variantId?: string | null;
  name: string;
  variantLabel?: string;
  image?: string | null;
  quantity: number;
  attributes?: Record<string, string | null>;
  price?: number | null;
  productId?: string | null;

  // ✅ MOQ
  moq?: number | null;
};

export type QuoteCustomer = {
  email: string;
  note?: string;
};

export type QuoteState = {
  items: QuoteItem[];
  isOpen: boolean;
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

// ✅ clamp quantity to MOQ (and basic integer safety)
function clampQtyToMoq(qty: number, moq?: number | null) {
  const minQty = Math.max(1, Number(moq ?? 1) || 1);
  const n = Number(qty);
  if (!Number.isFinite(n)) return minQty;
  return Math.max(minQty, Math.trunc(n));
}

const initialState: QuoteState = {
  items: [],
  isOpen: false,
  step: 1,
  customer: { email: "", note: "" },
};

const quoteSlice = createSlice({
  name: "quote",
  initialState,
  reducers: {
    hydrateQuote(state, action: PayloadAction<QuoteStateFromStorage>) {
      const incoming = Array.isArray(action.payload.items)
        ? action.payload.items
        : [];

      state.items = incoming.map((it) => ({
        ...it,
        quantity: clampQtyToMoq(it.quantity ?? 1, (it as any).moq ?? null),
      }));

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
        productId?: string | null;
        attributes?: Record<string, any>;
        price?: number | null;
        moq?: number | null;
      }>,
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
        moq = null,
      } = action.payload;

      const key = buildKey(slug, variantId);
      const index = state.items.findIndex(
        (it) => buildKey(it.slug, it.variantId) === key,
      );

      // normalize incoming qty relative to MOQ
      const incomingQty = clampQtyToMoq(quantity, moq);

      if (index !== -1) {
        const existing = state.items[index];

        // keep latest moq if provided (or fallback to existing)
        const effectiveMoq = moq ?? existing.moq ?? 1;

        // existing quantity + incoming quantity, then clamp to MOQ
        const nextQty = clampQtyToMoq(
          (existing.quantity ?? 0) + incomingQty,
          effectiveMoq,
        );

        existing.quantity = nextQty;
        existing.variantLabel = variantLabel ?? existing.variantLabel;
        existing.name = name ?? existing.name;
        existing.image = image ?? existing.image;
        existing.attributes = attributes ?? existing.attributes;
        existing.price = price ?? existing.price;

        existing.productId = productId ?? existing.productId ?? null;
        existing.moq = effectiveMoq as any;

        // move to front
        state.items.splice(index, 1);
        state.items.unshift(existing);
      } else {
        state.items.unshift({
          slug,
          productId,
          variantId,
          variantLabel,
          quantity: incomingQty, // ✅ MOQ enforced here
          name,
          image,
          attributes,
          price,
          moq,
        });
      }

      state.isOpen = true;
      state.step = 1;
    },

    removeFromQuote(
      state,
      action: PayloadAction<{ slug: string; variantId?: string | null }>,
    ) {
      const key = buildKey(
        action.payload.slug,
        action.payload.variantId ?? null,
      );
      state.items = state.items.filter(
        (it) => buildKey(it.slug, it.variantId) !== key,
      );
      if (state.items.length === 0) state.step = 1;
    },

    updateQuoteQuantity(
      state,
      action: PayloadAction<{
        slug: string;
        variantId?: string | null;
        quantity: number;
      }>,
    ) {
      const { slug, variantId = null, quantity } = action.payload;
      const key = buildKey(slug, variantId);

      const existing = state.items.find(
        (it) => buildKey(it.slug, it.variantId) === key,
      );
      if (!existing) return;

      // allow remove if <= 0 (keep your behavior)
      if (quantity <= 0) {
        state.items = state.items.filter(
          (it) => buildKey(it.slug, it.variantId) !== key,
        );
        if (state.items.length === 0) state.step = 1;
        return;
      }

      // ✅ clamp to MOQ
      existing.quantity = clampQtyToMoq(quantity, existing.moq);

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
      if (action.payload === 2 && state.items.length === 0) return;
      state.step = action.payload;
    },

    nextStep(state) {
      if (state.items.length === 0) return;
      state.step = 2;
    },

    prevStep(state) {
      state.step = 1;
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
  state.quote.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
