// src/lib/storefront/product-discovery.ts
import "server-only";
import type { Product as WooProduct } from "@/features/Products/types/products";
import { storefrontFetchSafe } from "@/shared/api/fetch";

/**
 * Latest products
 * GET /api/catalog/products/storefront/latest?limit=12&offset=0&search=...
 */
export async function listLatestProducts(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams({
    ...(params?.search ? { search: params.search } : {}),
    limit: String(params?.limit ?? 12),
    offset: String(params?.offset ?? 0),
  });

  const res = await storefrontFetchSafe<WooProduct[]>(
    `/api/catalog/products/storefront/latest?${qs.toString()}`,
    { revalidate: 60, tags: ["products:latest"] }
  );

  if (!res.ok) {
    console.error("listLatestProducts failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return [];
  }

  return res.data;
}

/**
 * On-sale products
 * GET /api/catalog/products/storefront/on-sale?limit=12&offset=0&search=...
 */
export async function listOnSaleProducts(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams({
    ...(params?.search ? { search: params.search } : {}),
    limit: String(params?.limit ?? 12),
    offset: String(params?.offset ?? 0),
  });

  const res = await storefrontFetchSafe<WooProduct[]>(
    `/api/catalog/products/storefront/on-sale?${qs.toString()}`,
    { revalidate: 60, tags: ["products:on-sale"] }
  );

  if (!res.ok) {
    console.error("listOnSaleProducts failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return [];
  }

  return res.data;
}

/**
 * Best sellers
 * GET /api/catalog/products/storefront/best-sellers?limit=12&offset=0&windowDays=30
 */
export async function listBestSellerProducts(params?: {
  limit?: number;
  offset?: number;
  windowDays?: number; // default 30
}) {
  const qs = new URLSearchParams({
    limit: String(params?.limit ?? 12),
    offset: String(params?.offset ?? 0),
    windowDays: String(params?.windowDays ?? 30),
  });

  const res = await storefrontFetchSafe<WooProduct[]>(
    `/api/catalog/products/storefront/best-sellers?${qs.toString()}`,
    { revalidate: 300, tags: ["products:best-sellers"] } // best-sellers can be cached longer
  );

  if (!res.ok) {
    console.error("listBestSellerProducts failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return [];
  }

  return res.data;
}
