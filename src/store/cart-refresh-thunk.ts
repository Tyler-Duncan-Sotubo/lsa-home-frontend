/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { hydrateCart } from "./cartSlice";

// in refreshCartAndHydrate thunk
function mapServerCartToItems(cart: any) {
  const items = cart?.items ?? [];
  if (!Array.isArray(items)) return [];

  return items.map((it: any) => ({
    slug: it.slug,
    variantId: it.variantId ?? null,
    quantity: Number(it.quantity ?? 1),

    name: it.name ?? "",
    image: it.image ?? null,
    unitPrice: Number(it.unitPrice ?? 0),

    // optional extras
    priceHtml: null,
    attributes: undefined,
    weightKg: it.weightKg ?? undefined,
  }));
}

export const refreshCartAndHydrate = createAsyncThunk(
  "cart/refreshCartAndHydrate",
  async (_, { dispatch }) => {
    const res = await fetch("/api/cart", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to refresh cart");
    const cart = await res.json();

    dispatch(hydrateCart({ items: mapServerCartToItems(cart) }));
    return cart;
  }
);
