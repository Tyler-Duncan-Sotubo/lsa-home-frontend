// src/features/Pages/Products/actions/get-linked-products.ts
"use server";

import "server-only";
import type { Product as WooProduct } from "@/features/Pages/Products/types/products";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type ProductLinkType = "related" | "upsell" | "cross_sell" | "accessory";

export async function getLinkedProductsStorefrontAction(
  productId: string,
  linkType?: ProductLinkType
): Promise<WooProduct[]> {
  const id = String(productId ?? "").trim();
  if (!id) return [];

  const qs = new URLSearchParams({
    ...(linkType ? { linkType: String(linkType) } : {}),
  });

  const res = await storefrontFetchSafe<WooProduct[]>(
    `/api/catalog/links/storefront/${encodeURIComponent(id)}${
      qs.toString() ? `?${qs.toString()}` : ""
    }`,
    {
      revalidate: 60,
      tags: [
        `product:${id}:links`,
        linkType ? `product:${id}:links:${linkType}` : "",
      ].filter(Boolean) as string[],
    }
  );

  if (!res.ok) {
    console.error("getLinkedProductsStorefrontAction failed", {
      statusCode: res.statusCode,
      error: res.error,
      productId: id,
      linkType,
    });
    return [];
  }

  return Array.isArray(res.data) ? res.data : [];
}
