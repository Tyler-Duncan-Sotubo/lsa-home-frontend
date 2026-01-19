/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { hydrateCart } from "./cartSlice";

type ApiCartResponse = {
  cartId: string | null;
  items: any[];
  subtotal: number;
};

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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = (await res.json()) as ApiCartResponse;

      if (!res.ok) {
        const msg =
          (data as any)?.error?.message ??
          (data as any)?.error ??
          "Unable to refresh cart";
        return rejectWithValue({ message: msg, status: res.status, data });
      }

      const items = Array.isArray(data?.items) ? data.items : [];

      // ✅ map API items -> Redux CartItem
      const mapped = items.map((it: any) => {
        const quantity = Number(it?.quantity ?? 0);

        // maxQty can be number or string ("100") from db
        const rawMax = it?.maxQty ?? it?.availableQty ?? null;
        const maxQty = rawMax == null ? null : Number(rawMax);

        return {
          slug: String(it?.slug ?? ""),
          variantId: it?.variantId ?? null,

          name: String(it?.name ?? it?.slug ?? ""),
          image: it?.image ?? null,

          unitPrice: Number(it?.unitPrice ?? 0),

          quantity: Number.isFinite(quantity) ? quantity : 1,
          maxQty: Number.isFinite(maxQty as any) ? (maxQty as number) : null,

          weightKg: it?.weightKg == null ? undefined : Number(it.weightKg),
          attributes: it?.attributes ?? undefined,
          priceHtml: it?.priceHtml ?? undefined,
        };
      });

      dispatch(hydrateCart({ items: mapped }));
      return { ok: true, count: mapped.length };
    } catch (err: any) {
      return rejectWithValue({
        message: err?.message ?? "Unable to refresh cart",
      });
    }
  },
);
