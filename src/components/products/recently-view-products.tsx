// src/components/products/recently-viewed-rail.tsx
"use client";

import { useAppSelector } from "@/store/hooks";
import { selectRecentlyViewedItems } from "@/store/recentlyViewedSlice";
import { ProductRail } from "@/components/products/product-rail";
import { Product } from "@/types/products";

interface RecentlyViewedRailProps {
  currentSlug?: string;
}

export function RecentlyViewedRail({ currentSlug }: RecentlyViewedRailProps) {
  const items = useAppSelector(selectRecentlyViewedItems);

  const products = items
    .filter((item) => {
      if (!currentSlug) return true;
      return item.slug !== currentSlug;
    })
    .map((item) => {
      // Build a minimal Woo-like product object from recently viewed state
      const idAsNumber =
        typeof item.id === "number" ? item.id : Number(item.id) || 0;

      return {
        id: idAsNumber,
        name: item.name,
        slug: item.slug ?? "",
        permalink: item.slug ? `/products/${item.slug}` : "#",

        // Pricing: coming from your Redux state (regularPrice / salePrice / onSale)
        price: item.salePrice ?? item.regularPrice ?? "",
        regular_price: item.regularPrice ?? "",
        sale_price: item.salePrice ?? "",
        on_sale: item.onSale ?? false,
        price_html: item.priceHtml ?? "",

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

        // Fields we don’t have in recently viewed yet (safe defaults)
        average_rating: "0",
        rating_count: 0,
        tags: [],
      };
    });

  if (products.length === 0) return null;

  return (
    <ProductRail
      title="Recently viewed"
      subtitle="Pick up where you left off."
      products={products as unknown as Product[]}
    />
  );
}
