/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/storefront/products.ts
import "server-only";
import type {
  Product,
  WooCategory,
  Product as WooProduct,
} from "@/features/Products/types/products";
import { storefrontFetchSafe } from "@/shared/api/fetch";

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
  },
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

  const res = await storefrontFetchSafe<CollectionResponse>(
    `/api/catalog/products/storefront/collections/${slug}?${qs.toString()}`,
    { tags: [`collection:${slug}`] },
  );

  if (!res.ok) {
    return { category: null as any, products: [] };
  }

  return res.data;
}

/**
 * GET products grouped under a parent category (your controller method).
 * Backend returns: Array<{ category: ..., products: WooProduct[] }>
 */
export type StorefrontCategoryGroup<TCategory = any> = {
  category: TCategory;
  products: WooProduct[];
};

export type StorefrontCollectionsHubResponse = {
  parent: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    afterContentHtml?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    imageUrl?: string | null;
    imageAltText?: string | null;
  };
  groups: StorefrontCategoryGroup[];
  exploreMore: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }[];
};

// ✅ UPDATED: use storefrontFetchSafe
export async function getCollectionProductsGroupedBySlug(
  slug: string,
  opts?: {
    perPage?: number;
    page?: number; // 1-based
    search?: string;
    includeChildren?: boolean;
    attr?: Record<string, string | string[]>;
  },
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

  const res = await storefrontFetchSafe<StorefrontCollectionsHubResponse>(
    `/api/catalog/products/storefront/collections/${slug}/grouped?${qs.toString()}`,
    { tags: [`collection-grouped:${slug}`] },
  );

  if (!res.ok) {
    console.error("getCollectionProductsGroupedBySlug failed", {
      statusCode: res.statusCode,
      error: res.error,
      slug,
      opts,
    });
    return { parent: null, groups: [], exploreMore: [] };
  }

  return res.data;
}

/**
 * NEW: categories storefront route
 * Backend: GET /api/catalog/categories-storefront?limit=#
 */
export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  imageAltText?: string | null;
  parentId?: string | null;
  hasChildren: boolean;
};

export async function listStorefrontCategories(params?: { limit?: number }) {
  const qs = new URLSearchParams({
    ...(typeof params?.limit === "number"
      ? { limit: String(params.limit) }
      : {}),
  });

  const url = qs.toString()
    ? `/api/catalog/categories-storefront?${qs.toString()}`
    : `/api/catalog/categories-storefront`;

  const res = await storefrontFetchSafe<StorefrontCategory[]>(url, {
    revalidate: 60,
    tags: ["categories-storefront"],
  });

  if (!res.ok) {
    return [];
  }

  return res.data;
}
