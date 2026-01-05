// src/features/Pages/Products/queries/use-upsell-products.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getLinkedProductsStorefrontAction,
  ProductLinkType,
} from "@/features/Pages/Products/actions/get-linked-products";

export function useLinkedProductsQuery(
  productId: string | null,
  linkType: ProductLinkType,
  isOpen?: boolean
) {
  return useQuery({
    queryKey: ["linked-products", productId, linkType],
    queryFn: () =>
      productId
        ? getLinkedProductsStorefrontAction(productId, linkType)
        : Promise.resolve([]),
    enabled: Boolean(productId) && Boolean(isOpen),
    staleTime: 1000 * 60 * 5,
  });
}
