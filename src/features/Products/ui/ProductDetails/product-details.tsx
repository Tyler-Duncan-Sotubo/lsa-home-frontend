/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { ProductDetailsQuoteOne } from "./variants/Quote/product-details-quote-one";
import { ProductDetailsCartOne } from "./variants/Cart/product-details-cart-one";
import { Product } from "../../types/products";
import { StorefrontConfigV1 } from "@/config/types/types";

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

const isProductInStock = (product: Product) => {
  const p: any = product;

  // Variable product: if any variation is buyable/in stock, treat as in stock
  if (Array.isArray(p.variations) && p.variations.length > 0) {
    return p.variations.some((v: any) => {
      if (v?.manage_stock) return Number(v?.stock_quantity ?? 0) > 0;
      if (v?.stock_status) return v.stock_status === "instock";
      return true;
    });
  }

  // Simple product fallback
  if (p?.manage_stock) return Number(p?.stock_quantity ?? 0) > 0;
  if (p?.stock_status) return p.stock_status === "instock";

  return true;
};

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
