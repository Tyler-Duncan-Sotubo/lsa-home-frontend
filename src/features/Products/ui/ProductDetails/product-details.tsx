 
import React, { useMemo } from "react";
import { ProductDetailsQuoteOne } from "./variants/Quote/product-details-quote-one";
import { ProductDetailsCartOne } from "./variants/Cart/product-details-cart-one";
import { Product } from "../../types/products";
import { StorefrontConfigV1 } from "@/config/types/types";
import { isProductInStock } from "@/shared/utils/product-stock";

type ProductUiConfig = NonNullable<
  NonNullable<NonNullable<StorefrontConfigV1["ui"]>["product"]>
>;

interface ProductDetailsProps {
  siteName?: string;
  config?: ProductUiConfig;
  product: Product;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  isModal?: boolean;
  onAddedToCart?: () => void;
}

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

const ProductDetails = ({
  siteName,
  config,
  product,
  selectedColor,
  setSelectedColor,
  isModal,
  onAddedToCart,
}: ProductDetailsProps) => {
  const configContext = config?.productDetails?.context ?? "CART";
  const showInfoSections = config?.productDetails?.showInfoSections ?? true;

  const effectiveContext = useMemo(() => {
    const isSerene = norm(siteName) === "serene";

    // Preserve all existing stores exactly as they are
    if (!isSerene) return configContext;

    // Serene-only hybrid logic
    return isProductInStock(product) ? "CART" : "QUOTE";
  }, [siteName, configContext, product]);

  switch (effectiveContext) {
    case "QUOTE": {
      return (
        <ProductDetailsQuoteOne
          product={product}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          isModal={isModal}
          onAddedToCart={onAddedToCart}
          showInfoSections={showInfoSections}
        />
      );
    }

    case "CART":
    default: {
      return (
        <ProductDetailsCartOne
          product={product}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          isModal={isModal}
          onAddedToCart={onAddedToCart}
          showInfoSections={showInfoSections}
          siteName={siteName}
        />
      );
    }
  }
};

export default ProductDetails;
