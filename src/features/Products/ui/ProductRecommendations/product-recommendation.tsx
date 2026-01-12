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
  switch (variant) {
    case "TABBED":
      return (
        <ProductRecommendationsTabbed
          productSlug={product.slug}
          relatedProducts={relatedProducts}
          defaultTab={defaultTab}
          className={className}
        />
      );

    case "STACKED":
    default:
      return (
        <ProductRecommendationsStacked
          productSlug={product.slug}
          relatedProducts={relatedProducts}
          className={className}
        />
      );
  }
};
