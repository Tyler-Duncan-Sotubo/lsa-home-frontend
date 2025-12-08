/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/products/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce/client";
import type { ProductReview } from "@/types/products";
import { redis } from "@/lib/redis";
import { REVIEW_FIELDS } from "@/constants/product-api";

async function deleteKeys(pattern: string) {
  if (!redis) return;

  const iter = redis.scanStream({ match: pattern });

  for await (const keys of iter) {
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}

// ----------------------------
// GET → Fetch existing reviews
// ----------------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const reviews = await wcFetch<ProductReview[]>("/products/reviews", {
      params: {
        product: productId,
        status: "all",
        per_page: 20,
        page: 1,
        _fields: REVIEW_FIELDS,
      },
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    // 👇 log the raw WooCommerce error so you can see it in your terminal
    console.error(
      "API product reviews fetch error:",
      error?.response?.data || error
    );
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// ----------------------------
// POST → Submit a review
// ----------------------------
// src/app/api/products/[id]/reviews/route.ts

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { rating, review, headline, name, email, slug } = body;

    if (!rating || !review || !headline || !name || !email) {
      return NextResponse.json(
        { error: "Missing required review fields." },
        { status: 400 }
      );
    }

    const fullReviewText = `**${headline}**\n\n${review}`;

    const response = await wcFetch("/products/reviews", {
      method: "POST",
      data: {
        product_id: productId,
        review: fullReviewText,
        reviewer: name,
        reviewer_email: email,
        rating,
      },
    });

    // -------------------------------------------
    // 🔥 CACHE INVALIDATION
    // -------------------------------------------
    if (redis) {
      // clear the specific reviews cache for this product
      await redis.del(`product:${productId}:reviews`);

      // clear any slug-based product caches (details, with-variations, related, etc)
      await deleteKeys(`product:${slug}:*`);
    }

    return NextResponse.json(
      { success: true, review: response },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Review submission error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to submit review",
      },
      { status: 500 }
    );
  }
}
