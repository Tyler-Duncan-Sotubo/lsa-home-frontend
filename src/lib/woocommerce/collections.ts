/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/woocommerce/collections.ts (or wherever you keep this)
import type { Product, WooCategory } from "@/types/products";
import { wcFetch } from "./client";
import { redis } from "@/lib/redis";

interface GetCollectionByCategorySlugOptions {
  page?: number;
  perPage?: number;
  includeChildren?: boolean;
  status?: "publish" | "any";
}

/**
 * Fetches all products for a given WooCommerce category slug,
 * optionally including direct child categories.
 *
 * Useful for "collections" pages like:
 *   /collections/pillows
 *   /collections/bedding/pillows/down-alternative-pillows-pairs
 */
export async function getCollectionByCategorySlug(
  categorySlug: string,
  {
    page = 1,
    perPage = 24,
    includeChildren = true,
    status = "publish",
  }: GetCollectionByCategorySlugOptions = {}
): Promise<{
  category: WooCategory | null;
  products: Product[];
  categoryIds: number[]; // ids actually used in the query
}> {
  const cacheKey = [
    "collection",
    categorySlug,
    page,
    perPage,
    includeChildren ? "with-children" : "no-children",
    status,
  ].join(":");

  // 1) Try cache
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as {
          category: WooCategory | null;
          products: Product[];
          categoryIds: number[];
        };
      } catch {
        // bad cache → ignore and refetch
      }
    }
  }

  // 2) Find the base category by slug
  const categories = await wcFetch<WooCategory[]>("/products/categories", {
    params: {
      slug: categorySlug,
      per_page: 1,
      hide_empty: false,
    },
  });

  const category = categories[0] ?? null;

  // If no category, cache the negative result too (to avoid repeated lookups)
  if (!category) {
    const result = {
      category: null,
      products: [] as Product[],
      categoryIds: [] as number[],
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60); // 1 hour
    }

    return result;
  }

  const categoryIds: number[] = [category.id];

  // 3) Optionally include direct children (e.g. "Down Alternative Pillows - PAIRS" under "Pillows")
  if (includeChildren) {
    const children = await wcFetch<WooCategory[]>("/products/categories", {
      params: {
        parent: category.id,
        per_page: 100,
        hide_empty: false,
      },
    });

    if (Array.isArray(children) && children.length > 0) {
      categoryIds.push(...children.map((c) => c.id));
    }
  }

  // 4) Fetch products for these category IDs
  const products = await wcFetch<Product[]>("/products", {
    params: {
      page,
      per_page: perPage,
      status,
      category: categoryIds.join(","), // Woo accepts comma-separated IDs
    },
  });

  const result = {
    category,
    products,
    categoryIds,
  };

  // 5) Store in cache
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60); // 1 hour TTL
  }

  return result;
}

interface GetParentCollectionsOptions {
  perChild?: number;
  status?: "publish" | "any";
}

/**
 * For a parent category slug (e.g. "all-bedding"),
 * fetch:
 *  - the parent category
 *  - its direct child categories (e.g. "Pillows", "Duvets")
 *  - a limited number of products for each child
 *
 * Perfect for pages like `/pages/all-bedding` that
 * show multiple sub-collections.
 */
export async function getParentCategoryCollections(
  parentSlug: string,
  { perChild = 8, status = "publish" }: GetParentCollectionsOptions = {}
): Promise<{
  parent: WooCategory | null;
  children: {
    category: WooCategory;
    products: Product[];
  }[];
}> {
  const cacheKey = ["parent-collection", parentSlug, perChild, status].join(
    ":"
  );

  // 1) Try cache
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as {
          parent: WooCategory | null;
          children: { category: WooCategory; products: Product[] }[];
        };
      } catch {
        // ignore bad cache
      }
    }
  }

  // 2) Find parent category by slug ("all-bedding")
  const parents = await wcFetch<WooCategory[]>("/products/categories", {
    params: {
      slug: parentSlug,
      per_page: 1,
      hide_empty: false,
    },
  });

  const parent = parents[0] ?? null;

  if (!parent) {
    const result = { parent: null, children: [] as any[] };
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60);
    }
    return result;
  }

  // 3) Get direct child categories (e.g. Pillows, Duvets)
  const childCategories = await wcFetch<WooCategory[]>("/products/categories", {
    params: {
      parent: parent.id,
      per_page: 100,
      hide_empty: false,
    },
  });

  if (!Array.isArray(childCategories) || childCategories.length === 0) {
    const result = { parent, children: [] as any[] };
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60);
    }
    return result;
  }

  // 4) For each child, fetch a small set of products
  const childrenWithProducts = await Promise.all(
    childCategories.map(async (cat) => {
      const products = await wcFetch<Product[]>("/products", {
        params: {
          per_page: perChild,
          status,
          category: cat.id, // single category id
        },
      });

      return {
        category: cat,
        products,
      };
    })
  );

  const result = {
    parent,
    children: childrenWithProducts,
  };

  // 5) Cache everything
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60); // 5 min
  }

  return result;
}
