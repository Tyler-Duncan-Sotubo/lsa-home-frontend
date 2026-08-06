// src/lib/storefront/products.ts
import "server-only";
import type { Product as WooProduct } from "@/features/Products/types/products";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function getProductBySlugWithVariations(slug: string) {
  const res = await storefrontFetchSafe<WooProduct>(
    `/api/catalog/products/storefront/${slug}`,
    // Tags alone (no revalidate) cache indefinitely — nothing calls
    // revalidateTag for these, so a status/channel/stock change would
    // never be reflected without this TTL.
    { revalidate: 60, tags: [`product:${slug}`, `product:${slug}:reviews`] },
  );

  if (!res.ok) {
    return null; // ✅ better than []
  }

  return res.data;
}

export async function listProducts(params?: {
  search?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams({
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
    limit: String(params?.limit ?? 12),
    offset: String(params?.offset ?? 0),
  });

  const res = await storefrontFetchSafe<WooProduct[]>(
    `/api/catalog/products/storefront?${qs.toString()}`,
    { revalidate: 60, tags: ["products"] },
  );

  if (!res.ok) {
    console.error("listProducts failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return [];
  }

  return res.data;
}
