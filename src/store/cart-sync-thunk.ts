/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToCart, updateCartQuantity, removeFromCart } from "./cartSlice";
import { refreshCartAndHydrate } from "./cart-refresh-thunk";
import { getBrowserQueryClient } from "@/shared/providers/query-client";

// Checkout has already snapshotted its own line items from the cart, so
// mutating the cart while on a checkout page (e.g. the "You may also like"
// rail) won't show up there until we push a resync of that snapshot.
async function resyncCheckoutIfOnCheckoutPage() {
  if (typeof window === "undefined") return;

  const match = window.location.pathname.match(/^\/checkout\/([^/]+)/);
  const checkoutId = match?.[1];
  if (!checkoutId) return;

  try {
    const res = await fetch(`/api/checkout/${checkoutId}/sync`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return;

    const updatedCheckout = await res.json();
    getBrowserQueryClient()?.setQueryData(
      ["checkout", checkoutId],
      updatedCheckout,
    );
  } catch {
    // best-effort — the checkout page's own polling/refetch will catch up
  }
}

export type CartUIPayload = {
  slug: string;
  variantId?: string | null;
  quantity: number;

  // UI-only fields
  name: string;
  image?: string | null;
  unitPrice: number;
  maxQty?: number | null;
  priceHtml?: string | null;
  attributes?: Record<string, any>;
  description?: string | null;
  weightKg?: number;
};

async function callApi(method: "POST" | "PATCH" | "DELETE", body: any) {
  const res = await fetch("/api/cart", {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.error?.message ?? "Cart sync failed",
      data,
    };
  }

  return data;
}

export const addToCartAndSync = createAsyncThunk(
  "cart/addToCartAndSync",
  async (input: CartUIPayload, { dispatch, rejectWithValue }) => {
    // 1️⃣ optimistic add
    dispatch(addToCart(input));

    try {
      await callApi("POST", {
        slug: input.slug,
        variantId: input.variantId ?? null,
        quantity: input.quantity,
      });

      // 2️⃣ reconcile once on success
      dispatch(refreshCartAndHydrate());
      await resyncCheckoutIfOnCheckoutPage();

      return { ok: true };
    } catch (err: any) {
      // 🔴 rollback optimistic add
      dispatch(
        removeFromCart({
          slug: input.slug,
          variantId: input.variantId ?? null,
        }),
      );

      return rejectWithValue({
        status: err?.status,
        message: err?.message ?? "Unable to add item to cart",
      });
    }
  },
);

export type AddBundleToCartInput = {
  bundleProductId: string;
  quantity: number;
  selections: { componentProductId: string; variantId: string }[];
};

async function callBundleApi(body: AddBundleToCartInput) {
  const res = await fetch("/api/cart/bundle-items", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.error?.message ?? "Unable to add bundle to cart",
      data,
    };
  }

  return data;
}

// Unlike addToCartAndSync, there's no optimistic dispatch here — a bundle's
// price/line id is server-computed from the customer's selections, so there
// is nothing sensible to render locally before the server responds.
export const addBundleToCartAndSync = createAsyncThunk(
  "cart/addBundleToCartAndSync",
  async (input: AddBundleToCartInput, { dispatch, rejectWithValue }) => {
    try {
      await callBundleApi(input);

      dispatch(refreshCartAndHydrate());
      await resyncCheckoutIfOnCheckoutPage();

      return { ok: true };
    } catch (err: any) {
      return rejectWithValue({
        status: err?.status,
        message: err?.message ?? "Unable to add bundle to cart",
      });
    }
  },
);

export const setQtyAndSync = createAsyncThunk(
  "cart/setQtyAndSync",
  async (
    input: { slug: string; variantId?: string | null; quantity: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const qty = Number(input.quantity);
      const variantId = input.variantId ?? null;

      // ✅ instant UI
      if (qty <= 0) {
        dispatch(removeFromCart({ slug: input.slug, variantId }));
        await callApi("DELETE", {
          productOrVariantId: variantId ?? input.slug,
        });
      } else {
        dispatch(
          updateCartQuantity({ slug: input.slug, variantId, quantity: qty }),
        );
        await callApi("PATCH", {
          productOrVariantId: variantId ?? input.slug,
          quantity: qty,
        });
      }

      dispatch(refreshCartAndHydrate());
      return { ok: true };
    } catch (err: any) {
      // ✅ rollback immediately
      dispatch(refreshCartAndHydrate());

      return rejectWithValue({
        message: err?.message ?? "Unable to update quantity",
        status: err?.status ?? 500,
      });
    }
  },
);

export const removeItemAndSync = createAsyncThunk(
  "cart/removeItemAndSync",
  async (input: { slug: string; variantId?: string | null }, { dispatch }) => {
    const variantId = input.variantId ?? null;

    dispatch(removeFromCart({ slug: input.slug, variantId })); // ✅ instant UI
    await callApi("DELETE", { productOrVariantId: variantId ?? input.slug });

    dispatch(refreshCartAndHydrate()); // ✅ reconcile once
  },
);
