/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type BundleSelectionSnapshot = {
  componentProductId: string;
  componentName?: string | null;
  componentSlug?: string | null;
  componentImage?: string | null;
  variantId: string;
  variantTitle?: string | null;
  attributes?: Record<string, string>;
  quantity?: number;
};

export type CartItem = {
  slug: string;
  variantId?: string | null;

  // ✅ UI fields
  name: string;
  image?: string | null;
  unitPrice: number;

  quantity: number;
  maxQty?: number | null;

  // optional
  priceHtml?: string | null;
  attributes?: Record<string, string | null>;
  description?: string | null;
  weightKg?: number;

  // present only on bundle line items — snapshot of what the customer
  // picked per component, for display in the cart/checkout UI.
  bundleSelections?: BundleSelectionSnapshot[] | null;
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
      const incoming = Array.isArray(action.payload.items)
        ? action.payload.items
        : [];

      const existingByKey = new Map<string, CartItem>();
      for (const it of state.items) {
        existingByKey.set(buildKey(it.slug, it.variantId ?? null), it);
      }

      state.items = incoming
        .map((raw: any) => {
          const slug = String(raw?.slug ?? "");
          const variantId = raw?.variantId ?? null;
          const key = buildKey(slug, variantId);
          const prev = existingByKey.get(key);

          const qty = Number(raw?.quantity);
          const nextQty = Number.isFinite(qty) ? qty : (prev?.quantity ?? 1);

          const rawMax = raw?.maxQty ?? raw?.availableQty ?? undefined;
          const max = rawMax == null ? undefined : Number(rawMax);
          const nextMaxQty = Number.isFinite(max)
            ? max
            : (prev?.maxQty ?? null);

          return {
            slug,
            variantId,
            name: String(raw?.name ?? prev?.name ?? slug),
            image: raw?.image ?? prev?.image ?? null,
            unitPrice: Number.isFinite(Number(raw?.unitPrice))
              ? Number(raw.unitPrice)
              : (prev?.unitPrice ?? 0),
            quantity: nextQty,
            maxQty: nextMaxQty,

            priceHtml: raw?.priceHtml ?? prev?.priceHtml ?? null,
            attributes: raw?.attributes ?? prev?.attributes,
            description: raw?.description ?? prev?.description ?? null,
            weightKg:
              typeof raw?.weightKg === "number" ? raw.weightKg : prev?.weightKg,
            bundleSelections:
              raw?.bundleSelections ?? prev?.bundleSelections ?? null,
          } as CartItem;
        })
        .filter((it) => it.slug && it.quantity > 0);
    },

    addToCart(state, action) {
      const {
        slug,
        variantId = null,
        quantity = 1,
        name,
        image = null,
        unitPrice,
        maxQty = null,
        priceHtml = null,
        attributes,
        description = null,
        weightKg,
      } = action.payload;

      const key = buildKey(slug, variantId);
      const index = state.items.findIndex(
        (it) => buildKey(it.slug, it.variantId) === key,
      );

      const clamp = (q: number) => {
        if (maxQty == null) return q; // unlimited / unknown
        return Math.max(0, Math.min(q, maxQty)); // ✅ enforce stock
      };

      if (index !== -1) {
        const existing = state.items[index];
        existing.quantity = clamp(existing.quantity + quantity);
        existing.maxQty = maxQty;

        existing.name = name;
        existing.image = image;
        existing.unitPrice = unitPrice;
        existing.priceHtml = priceHtml ?? existing.priceHtml;
        existing.attributes = attributes ?? existing.attributes;
        existing.description = description ?? existing.description;
        existing.weightKg = weightKg ?? existing.weightKg;

        state.items.splice(index, 1);
        if (existing.quantity > 0) state.items.unshift(existing);
      } else {
        const q = clamp(quantity);
        if (q > 0) {
          state.items.unshift({
            slug,
            variantId,
            quantity: q,
            name,
            image,
            unitPrice,
            maxQty,
            priceHtml,
            attributes,
            description,
            weightKg,
          });
        }
      }

      state.isOpen = true;
    },

    removeFromCart(
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
    },

    updateCartQuantity(state, action) {
      const { slug, variantId = null, quantity } = action.payload;
      const key = buildKey(slug, variantId);

      const existing = state.items.find(
        (it) => buildKey(it.slug, it.variantId) === key,
      );
      if (!existing) return;

      const maxQty = existing.maxQty ?? null;
      const clamped =
        maxQty == null ? quantity : Math.max(0, Math.min(quantity, maxQty));

      if (clamped <= 0) {
        state.items = state.items.filter(
          (it) => buildKey(it.slug, it.variantId) !== key,
        );
      } else {
        existing.quantity = clamped;
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
    0,
  );

export const selectCartTotalWeightKg = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + (item.weightKg ?? 0) * item.quantity,
    0,
  );

export const selectCartIsOpen = (state: RootState) => state.cart.isOpen;
