import React from "react";
import { Product } from "../../types/products";
import { StorefrontConfigV1 } from "@/config/types/types";
import { ProductRecommendationsTabbed } from "./product-recommendation-tabbed";
import { ProductRecommendationsStacked } from "./product-recommendation-stacked";

interface ProductRecommendationsProps {
  product: Product;
  relatedProducts: Product[];
  config?: NonNullable<
    NonNullable<NonNullable<StorefrontConfigV1["ui"]>["product"]>
  >;
  className?: string;
}

export const ProductRecommendations = ({
  product,
  relatedProducts,
  config,
  className,
}: ProductRecommendationsProps) => {
  const variant = config?.recommendations?.variant ?? "STACKED";
  const defaultTab = config?.recommendations?.defaultTab;

  // ✅ Exclude the current product from related products
  const filteredRelatedProducts = relatedProducts.filter((p) => {
    if (p?.slug && product?.slug) return p.slug !== product.slug;
    return true;
  });

  switch (variant) {
    case "TABBED":
      return (
        <ProductRecommendationsTabbed
          productSlug={product.slug}
          relatedProducts={filteredRelatedProducts}
          defaultTab={defaultTab}
          className={className}
        />
      );

    case "STACKED":
    default:
      return (
        <ProductRecommendationsStacked
          productSlug={product.slug}
          relatedProducts={filteredRelatedProducts}
          className={className}
        />
      );
  }
};
