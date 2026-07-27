// src/components/products/recently-viewed-rail.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useEffectEvent } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectRecentlyViewedItems } from "@/store/recentlyViewedSlice";
import type { Product } from "@/features/Products/types/products";
import { ProductRail } from "../ProductRail/product-rail";

interface RecentlyViewedRailProps {
  currentSlug?: string;
  defaultTab?: "recent" | "collection";
}

export function RecentlyViewedRail({
  currentSlug,
  defaultTab,
}: RecentlyViewedRailProps) {
  const items = useAppSelector(selectRecentlyViewedItems);

  // ✅ hydration-safe mount gate
  const [mounted, setMounted] = useState(false);

  const markMounted = useEffectEvent(() => {
    setMounted(true);
  });

  useEffect(() => {
    markMounted();
  }, []);

  const products = useMemo(() => {
    return items
      .filter((item) => {
        if (!currentSlug) return true;
        return item.slug !== currentSlug;
      })
      .slice(0, 6)
      .map((item) => {
        const idAsNumber =
          typeof item.id === "number" ? item.id : Number(item.id) || 0;

        return {
          id: idAsNumber,
          name: item.name,
          slug: item.slug ?? "",
          permalink: item.slug ? `/products/${item.slug}` : "#",

          // Pricing
          price: item.salePrice ?? item.regularPrice ?? "",
          regular_price: item.regularPrice ?? "",
          sale_price: item.salePrice ?? "",
          on_sale: item.onSale ?? false,
          price_html: item.priceHtml ?? "",
          average_rating: item.averageRating ?? "0",
          rating_count: item.ratingCount ?? 0,

          // Image
          images: item.image
            ? [
                {
                  id: idAsNumber,
                  src: item.image,
                  alt: item.name,
                },
              ]
            : [],

          tags: [],
        } as unknown as Product;
      });
  }, [items, currentSlug]);

  if (!mounted) return null;
  if (products.length === 0) return null;

  return (
    <ProductRail
      title={defaultTab ? "" : "Recently Viewed"}
      subtitle={defaultTab ? "" : "Pick up where you left off."}
      products={products}
      sectionClassName="py-8"
    />
  );
}
