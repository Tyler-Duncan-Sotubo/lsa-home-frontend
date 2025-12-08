/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/woocommerce/collections.ts

import type { Product, WooCategory } from "@/types/products";
import { wcFetch } from "./client";
import { redis } from "@/lib/redis";
import {
  PRODUCT_LIST_WITH_FILTER_FIELDS,
  CATEGORY_FIELDS,
} from "@/constants/product-api";

interface GetCollectionByCategorySlugOptions {
  page?: number;
  perPage?: number;
  includeChildren?: boolean;
  status?: "publish" | "any";
}

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
  categoryIds: number[];
}> {
  const cacheKey = [
    "collection",
    categorySlug,
    page,
    perPage,
    includeChildren ? "with-children" : "no-children",
    status,
  ].join(":");

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
        // ignore bad cache
      }
    }
  }

  // 2) Find the base category by slug
  const categories = await wcFetch<WooCategory[]>("/products/categories", {
    params: {
      slug: categorySlug,
      per_page: 1,
      hide_empty: false,
      _fields: CATEGORY_FIELDS,
    },
  });

  const category = categories[0] ?? null;

  if (!category) {
    const result = {
      category: null,
      products: [] as Product[],
      categoryIds: [] as number[],
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60);
    }

    return result;
  }

  const categoryIds: number[] = [category.id];

  // 3) Optionally include direct children
  if (includeChildren) {
    const children = await wcFetch<WooCategory[]>("/products/categories", {
      params: {
        parent: category.id,
        per_page: 100,
        hide_empty: false,
        _fields: CATEGORY_FIELDS,
      },
    });

    if (Array.isArray(children) && children.length > 0) {
      categoryIds.push(...children.map((c) => c.id));
    }
  }

  // 4) Fetch products for these category IDs (now with tags + attributes)
  const products = await wcFetch<Product[]>("/products", {
    params: {
      page,
      per_page: perPage,
      status,
      category: categoryIds.join(","),
      _fields: PRODUCT_LIST_WITH_FILTER_FIELDS,
    },
  });

  const result = {
    category,
    products,
    categoryIds,
  };

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60);
  }

  return result;
}

interface GetParentCollectionsOptions {
  perChild?: number;
  status?: "publish" | "any";
}

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

  const parents = await wcFetch<WooCategory[]>("/products/categories", {
    params: {
      slug: parentSlug,
      per_page: 1,
      hide_empty: false,
      _fields: CATEGORY_FIELDS,
    },
  });

  const parent = parents[0] ?? null;

  if (!parent) {
    const result = { parent: null, children: [] as any[] };
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 660 * 60 * 24);
    }
    return result;
  }

  const childCategories = await wcFetch<WooCategory[]>("/products/categories", {
    params: {
      parent: parent.id,
      per_page: 100,
      hide_empty: false,
      _fields: CATEGORY_FIELDS,
    },
  });

  if (!Array.isArray(childCategories) || childCategories.length === 0) {
    const result = { parent, children: [] as any[] };
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 24);
    }
    return result;
  }

  // For each child, fetch products (also with tags + attributes for filters)
  const childrenWithProducts = await Promise.all(
    childCategories.map(async (cat) => {
      const products = await wcFetch<Product[]>("/products", {
        params: {
          per_page: perChild,
          status,
          category: cat.id,
          _fields: PRODUCT_LIST_WITH_FILTER_FIELDS,
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

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 24);
  }

  return result;
}
