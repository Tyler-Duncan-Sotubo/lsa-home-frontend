// src/lib/woocommerce/products.ts
import { wcFetch } from "./client";
import type { Product, WooVariation } from "@/types/products";
import { redis } from "@/lib/redis";

type GetProductsOptions = {
  page?: number;
  perPage?: number;
  categoryId?: number;
  search?: string;
};

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
  };

  if (categoryId) params.category = categoryId;
  if (search) params.search = search;

  // ✅ use new wcFetch signature
  const products = await wcFetch<Product[]>("/products", {
    params,
  });

  // 2) Store in cache (shorter TTL for lists)
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(products), "EX", 60 * 5); // 5 min
  }

  return products;
}

// Simple version (no variations)
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
    },
  });

  const product = products[0] ?? null;

  if (product && redis) {
    await redis.set(cacheKey, JSON.stringify(product), "EX", 60 * 5); // 5 min
  }

  return product;
}

// Full version: product + variations as full objects
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

  const products = await wcFetch<Product[]>("/products", {
    params: {
      slug,
      status: "publish",
      per_page: 1,
    },
  });

  const product = products[0];
  if (!product) return null;

  // Non-variable: no variations to fetch
  if (product.type !== "variable") {
    const result: Product & { variations?: WooVariation[] } = {
      ...product,
      variations: undefined,
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 5); // 60 min
      // (shorter TTL since it's a single product)
    }

    return result;
  }

  // Variable: fetch full variation objects
  const variations = await wcFetch<WooVariation[]>(
    `/products/${product.id}/variations`,
    {
      params: {
        per_page: 100,
        status: "publish",
      },
    }
  );

  const result: Product & { variations?: WooVariation[] } = {
    ...product,
    variations,
  };

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 5); // 5 min
  }

  return result;
}
