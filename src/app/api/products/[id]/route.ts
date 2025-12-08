import { NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce/client";
import { redis } from "@/lib/redis";
import type { Product, WooVariation } from "@/types/products";
import { VARIATION_FIELDS } from "@/constants/product-api";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // if your app router typing changes, you can drop the Promise
) {
  // ⬅️ MUST await (per your current setup)
  const { id } = await context.params;

  const cacheKey = `product:id:${id}:with-variations`;

  // 1) Try Redis cache first
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached as string) as Product & {
          variations?: WooVariation[];
        };
        return NextResponse.json(parsed);
      } catch {
        // bad cache → ignore and fetch fresh
      }
    }
  }

  try {
    // 2) Fetch base product by ID from Woo
    const product = await wcFetch<Product>(`/products/${id}`, {});

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 3) Simple product: no variations
    if (product.type !== "variable") {
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(product), "EX", 60 * 5); // 5 min
      }

      return NextResponse.json(product);
    }

    // 4) Variable product: fetch variations
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

    // 5) Cache combined product+variations
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 24);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
