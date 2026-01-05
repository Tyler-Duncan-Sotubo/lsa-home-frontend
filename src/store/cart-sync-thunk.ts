/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToCart, updateCartQuantity, removeFromCart } from "./cartSlice";
import { refreshCartAndHydrate } from "./cart-refresh-thunk";

export type CartUIPayload = {
  slug: string;
  variantId?: string | null;
  quantity: number;

  // UI-only fields
  name: string;
  image?: string | null;
  unitPrice: number;
  priceHtml?: string | null;
  attributes?: Record<string, any>;
  weightKg?: number;
};

async function callApi(method: "POST" | "PATCH" | "DELETE", body: any) {
  const res = await fetch("/api/cart", {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log("callApi response:", res);
  if (!res.ok) throw new Error("Cart sync failed");
  return res.json(); // if your API returns cart, great
}

export const addToCartAndSync = createAsyncThunk(
  "cart/addToCartAndSync",
  async (input: CartUIPayload, { dispatch }) => {
    dispatch(addToCart(input)); // ✅ instant UI

    await callApi("POST", {
      slug: input.slug,
      variantId: input.variantId ?? null,
      quantity: input.quantity,
    });

    // ✅ reconcile once (Shopify-style)
    dispatch(refreshCartAndHydrate());
  }
);

export const setQtyAndSync = createAsyncThunk(
  "cart/setQtyAndSync",
  async (
    input: { slug: string; variantId?: string | null; quantity: number },
    { dispatch }
  ) => {
    const qty = Number(input.quantity);
    const variantId = input.variantId ?? null;

    // ✅ instant UI
    if (qty <= 0) {
      dispatch(removeFromCart({ slug: input.slug, variantId }));
      await callApi("DELETE", { productOrVariantId: variantId ?? input.slug });
    } else {
      dispatch(
        updateCartQuantity({ slug: input.slug, variantId, quantity: qty })
      );
      await callApi("PATCH", {
        productOrVariantId: variantId ?? input.slug,
        quantity: qty,
      });
    }

    // ✅ reconcile once
    dispatch(refreshCartAndHydrate());
  }
);

export const removeItemAndSync = createAsyncThunk(
  "cart/removeItemAndSync",
  async (input: { slug: string; variantId?: string | null }, { dispatch }) => {
    const variantId = input.variantId ?? null;

    dispatch(removeFromCart({ slug: input.slug, variantId })); // ✅ instant UI
    await callApi("DELETE", { productOrVariantId: variantId ?? input.slug });

    dispatch(refreshCartAndHydrate()); // ✅ reconcile once
  }
);
