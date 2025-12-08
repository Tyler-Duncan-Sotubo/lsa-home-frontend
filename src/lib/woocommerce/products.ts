// src/lib/woocommerce/products.ts

import { wcFetch } from "./client";
import type { Product, WooVariation, ProductReview } from "@/types/products";
import { redis } from "@/lib/redis";
import {
  PRODUCT_DETAIL_FIELDS,
  PRODUCT_LIST_FIELDS,
  REVIEW_FIELDS,
  VARIATION_FIELDS,
} from "@/constants/product-api";

type GetProductsOptions = {
  page?: number;
  perPage?: number;
  categoryId?: number;
  search?: string;
};

/**
 * Get paginated products for listing (category page, search, etc.)
 * NOTE: This uses PRODUCT_LIST_FIELDS, so it does NOT include heavy fields
 * like full description/meta_data/weight (only stock_status for UI).
 */
export async function getProducts(
  options: GetProductsOptions = {}
): Promise<Product[]> {
  const { page = 1, perPage = 12, categoryId, search } = options;

  const cacheKey = `products:${page}:${perPage}:${categoryId ?? "all"}:${
    search ?? "none"
  }`;

  // 1) Try cache
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as Product[];
      } catch {
        // bad cache → fall through to fetch
      }
    }
  }

  const params: Record<string, string | number | undefined> = {
    page,
    per_page: perPage,
    status: "publish",
    _fields: PRODUCT_LIST_FIELDS,
  };

  if (categoryId) params.category = categoryId;
  if (search) params.search = search;

  const products = await wcFetch<Product[]>("/products", {
    params,
  });

  // 2) Store in cache (5 minutes)
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(products), "EX", 60 * 5);
  }

  return products;
}

/**
 * Get a single product by slug (no variations attached).
 * Full detail product (including weight + stock info).
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const cacheKey = `product:${slug}:basic`;

  // 1) Try cache
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as Product;
      } catch {
        // ignore and fetch fresh
      }
    }
  }

  const products = await wcFetch<Product[]>("/products", {
    params: {
      slug,
      status: "publish",
      per_page: 1,
      _fields: PRODUCT_DETAIL_FIELDS,
    },
  });

  const product = products[0] ?? null;

  if (product && redis) {
    // 60 minutes
    await redis.set(cacheKey, JSON.stringify(product), "EX", 60 * 60 * 24);
  }

  return product;
}

/**
 * Get a single product by slug, including full variation objects.
 * Uses:
 *  - PRODUCT_DETAIL_FIELDS for the base product
 *  - VARIATION_FIELDS for each variation
 */
export async function getProductBySlugWithVariations(
  slug: string
): Promise<(Product & { variations?: WooVariation[] }) | null> {
  const cacheKey = `product:${slug}:with-variations`;

  // 1) Try cache
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached as string) as Product & {
          variations?: WooVariation[];
        };
      } catch {
        // ignore bad cache
      }
    }
  }

  // 2) Fetch base product
  const products = await wcFetch<Product[]>("/products", {
    params: {
      slug,
      status: "publish",
      per_page: 1,
      _fields: PRODUCT_DETAIL_FIELDS,
    },
  });

  const product = products[0];
  if (!product) return null;

  // Non-variable: nothing extra to fetch
  if (product.type !== "variable") {
    const result: Product & { variations?: WooVariation[] } = {
      ...product,
      variations: undefined,
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 24);
    }

    return result;
  }

  // 3) Variable product: fetch full variation objects (trimmed via _fields)
  const variations = await wcFetch<WooVariation[]>(
    `/products/${product.id}/variations`,
    {
      params: {
        per_page: 100,
        status: "publish",
        _fields: VARIATION_FIELDS,
      },
    }
  );

  const result: Product & { variations?: WooVariation[] } = {
    ...product,
    variations,
  };

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 24);
  }

  return result;
}

/**
 * Get approved reviews for a product (trimmed via _fields).
 */
export async function getProductReviews(
  productId: number
): Promise<ProductReview[]> {
  return wcFetch<ProductReview[]>("/products/reviews", {
    params: {
      product: productId,
      status: "approved",
      _fields: REVIEW_FIELDS,
    },
  });
}
