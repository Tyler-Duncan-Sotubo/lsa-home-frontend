/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/storefront/products.ts
import "server-only";
import type {
  Product,
  WooCategory,
  Product as WooProduct,
} from "@/features/Pages/Products/types/products";
import { storefrontFetch } from "@/shared/api/fetch";

type CollectionResponse = {
  category: WooCategory;
  products: Product[];
};

export async function listCollectionProducts(
  slug: string,
  opts?: {
    perPage?: number;
    page?: number; // 1-based
    search?: string;
    includeChildren?: boolean;
    attr?: Record<string, string | string[]>;
  }
) {
  const perPage = opts?.perPage ?? 24;
  const page = opts?.page ?? 1;
  const offset = (page - 1) * perPage;

  const qs = new URLSearchParams({
    ...(opts?.search && { search: opts.search }),
    limit: String(perPage),
    offset: String(offset),
    includeChildren: String(opts?.includeChildren ?? true),
  });

  if (opts?.attr) {
    for (const [k, v] of Object.entries(opts.attr)) {
      const values = Array.isArray(v) ? v : [v];
      for (const val of values) qs.append(`attr[${k}]`, val);
    }
  }

  // ✅ Backend returns WooProduct[]
  return storefrontFetch<CollectionResponse>(
    `/api/catalog/products/storefront/collections/${slug}?${qs.toString()}`,
    { tags: [`collection:${slug}`] }
  );
}

/**
 * GET products grouped under a parent category (your controller method).
 * Backend returns: Array<{ category: ..., products: WooProduct[] }>
 */
export type StorefrontCategoryGroup<TCategory = any> = {
  category: TCategory;
  products: WooProduct[];
};

// ✅ UPDATED: use slug (not categoryId)
export async function getCollectionProductsGroupedBySlug(
  slug: string,
  opts?: {
    perPage?: number;
    page?: number; // 1-based
    search?: string;
    includeChildren?: boolean;
    attr?: Record<string, string | string[]>;
  }
) {
  const perPage = opts?.perPage ?? 24;
  const page = opts?.page ?? 1;
  const offset = (page - 1) * perPage;

  const qs = new URLSearchParams({
    ...(opts?.search && { search: opts.search }),
    limit: String(perPage),
    offset: String(offset),
    includeChildren: String(opts?.includeChildren ?? true),
  });

  if (opts?.attr) {
    for (const [k, v] of Object.entries(opts.attr)) {
      const values = Array.isArray(v) ? v : [v];
      for (const val of values) qs.append(`attr[${k}]`, val);
    }
  }

  return storefrontFetch<StorefrontCategoryGroup[]>(
    `/api/catalog/products/storefront/collections/${slug}/grouped?${qs.toString()}`,
    { tags: [`collection-grouped:${slug}`] }
  );
}
