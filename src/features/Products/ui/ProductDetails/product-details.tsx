import React from "react";
import { ProductDetailsQuoteOne } from "./variants/Quote/product-details-quote-one";
import { ProductDetailsCartOne } from "./variants/Cart/product-details-cart-one";
import { Product } from "../../types/products";
import { StorefrontConfigV1 } from "@/config/types/types";

type ProductUiConfig = NonNullable<
  NonNullable<NonNullable<StorefrontConfigV1["ui"]>["product"]>
>;

interface ProductDetailsProps {
  config?: ProductUiConfig;
  product: Product;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  isModal?: boolean;
  onAddedToCart?: () => void;
}

const ProductDetails = ({
  config,
  product,
  selectedColor,
  setSelectedColor,
  isModal,
  onAddedToCart,
}: ProductDetailsProps) => {
  const context = config?.productDetails?.context ?? "CART";
  const variant = config?.productDetails?.variant ?? "V1";
  const showInfoSections = config?.productDetails?.showInfoSections ?? true;

  switch (context) {
    case "QUOTE": {
      switch (variant) {
        case "V2":
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

        case "V1":
        default:
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
        />
      );
    }
  }
};

export default ProductDetails;
