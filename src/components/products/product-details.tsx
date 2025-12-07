/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Rating } from "./reviews/rating";
import { VariantSelectors } from "./variant-selectors";
import { ProductInfoSections } from "./product-info-sections";
import { WishlistButton } from "./wishlist-button";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { Product } from "@/types/products";

export interface ProductDetailsPanelProps {
  product: Product;
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void; // sync with gallery
  isModal?: boolean; // if used in a modal/dialog
  onAddedToCart?: () => void;
}

// Helper to safely format NGN
const formatNaira = (value?: string | number | null) => {
  if (!value && value !== 0) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return num.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
};

export function ProductDetailsPanel({
  product,
  selectedColor,
  onSelectColor,
  isModal,
  onAddedToCart,
}: ProductDetailsPanelProps) {
  const [quantity, setQuantity] = useState(1);

  const { colorAttributes, sizeAttributes } = useMemo(() => {
    const attrs = product?.attributes ?? [];
    const color = attrs.filter((a) => a.name.toLowerCase().includes("color"));
    const size = attrs.filter((a) => a.name.toLowerCase().includes("size"));
    const other = attrs.filter(
      (a) =>
        !a.name.toLowerCase().includes("color") &&
        !a.name.toLowerCase().includes("size")
    );
    return {
      colorAttributes: color,
      sizeAttributes: size,
      otherAttributes: other,
    };
  }, [product]);

  const rating = Number(product.average_rating ?? 0);
  const reviews = product.rating_count ?? 0;

  const firstSize = sizeAttributes[0]?.options?.[0] ?? null;
  const firstColor = colorAttributes[0]?.options?.[0] ?? null;

  // user-chosen size (can be null initially)
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // the size we actually use
  const effectiveSize = selectedSize ?? firstSize;

  // Ensure a base colour & sync to gallery
  useEffect(() => {
    if (!onSelectColor || !firstColor) return;
    if (!selectedColor) {
      onSelectColor(firstColor);
    }
  }, [firstColor, onSelectColor, selectedColor]);

  const effectiveColor = selectedColor || firstColor || null;

  // Resolve active variation based on selected size + color
  const activeVariation = useMemo(() => {
    const variations = product.variations ?? [];
    if (variations.length === 0) return null;

    const match = variations.find((v) => {
      const attrs = v.attributes ?? [];
      const sizeAttr = attrs.find((a) => a.name.toLowerCase().includes("size"));
      const colorAttr = attrs.find((a) =>
        a.name.toLowerCase().includes("color")
      );

      const sizeMatch = effectiveSize
        ? sizeAttr?.option.toLowerCase() === effectiveSize.toLowerCase()
        : true;

      const colorMatch = effectiveColor
        ? colorAttr?.option.toLowerCase() === effectiveColor.toLowerCase()
        : true;

      return sizeMatch && colorMatch;
    });

    return match ?? variations[0];
  }, [product.variations, effectiveColor, effectiveSize]);

  // After activeVariation, before return
  const isInStock = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    // Variation-level stock (strongest signal)
    if (vAny?.stock_status) {
      return vAny.stock_status === "instock"; // 👈 primary field
    }

    // Product-level fallback
    if (pAny?.stock_status) {
      return pAny.stock_status === "instock";
    }

    // Ultimate fallback
    return true;
  }, [activeVariation, product]);

  // Determine weight in kg from variation or product (Woo stores as string)
  const weightKg = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    const rawWeight = vAny?.weight ?? pAny?.weight ?? null;
    if (!rawWeight) return 0;

    const numeric = Number(rawWeight);
    return Number.isFinite(numeric) ? numeric : undefined;
  }, [activeVariation, product]);

  // Choose the image for the active variation, fallback to product image
  const variationImageSrc = useMemo(() => {
    if (!activeVariation) {
      return product.images?.[0]?.src ?? null;
    }

    const av: any = activeVariation as any;

    const singleImageSrc = av.image?.src ?? av.image?.url ?? null;
    const galleryImageSrc = av.images?.[0]?.src ?? av.images?.[0]?.url ?? null;

    return (
      singleImageSrc ?? galleryImageSrc ?? product.images?.[0]?.src ?? null
    );
  }, [activeVariation, product.images]);

  // Normalize price info: regular / sale / onSale from variation or product
  const { regularPrice, salePrice, onSale, unitPrice } = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    // Variation-level pricing
    const vRegular = vAny?.regular_price ?? null;
    const vSale = vAny?.sale_price ?? null;
    const vPrice = vAny?.price ?? null;
    const vOnSale = vAny?.on_sale ?? false;

    // Product-level pricing (useful fallback)
    const pRegular = pAny?.regular_price ?? null;
    const pSale = pAny?.sale_price ?? null;
    const pPrice = pAny?.price ?? null;
    const pOnSale = pAny?.on_sale ?? false;

    // Final values exposed to UI
    const finalRegular = vRegular || vPrice || pRegular || pPrice || null;
    const finalSale = vSale || pSale || null;
    const finalOnSale = vOnSale || pOnSale || false;

    const numericUnit = Number(finalSale || finalRegular || pPrice || 0) || 0;

    return {
      regularPrice: finalRegular,
      salePrice: finalSale,
      onSale: finalOnSale,
      unitPrice: numericUnit,
    };
  }, [activeVariation, product]);

  const formattedRegular = formatNaira(regularPrice);
  const formattedSale = formatNaira(salePrice);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Header */}
      <header className="text-left mb-3">
        <h1 className="text-lg md:text-2xl font-semibold">{product.name}</h1>
        <div
          className="my-2 text-xs md:text-sm text-muted-foreground prose prose-sm
             prose-p:mt-0 prose-p:mb-2"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        {isModal && (
          <div className="mt-4 text-xs md:text-sm text-muted-foreground">
            <span>Get All The Details.</span>
            <Link
              href={`/products/${product.slug}`}
              className="font-semibold underline ml-1"
            >
              View Full Page
            </Link>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-4 pb-6">
        <Rating rating={rating} reviews={reviews} />

        {/* Size + Colour selectors */}
        <VariantSelectors
          colorAttributes={colorAttributes}
          sizeAttributes={sizeAttributes}
          selectedColor={effectiveColor}
          selectedSize={effectiveSize}
          onSelectColor={onSelectColor}
          onSelectSize={setSelectedSize}
          variations={product.variations}
        />

        {/* Price */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {onSale && formattedSale && formattedRegular ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm md:text-base line-through text-muted-foreground">
                  {formattedRegular}
                </span>
                <span className="text-base md:text-lg font-semibold text-primary">
                  {formattedSale}
                </span>
              </div>
            ) : formattedRegular ? (
              <span className="text-base md:text-lg font-semibold">
                {formattedRegular}
              </span>
            ) : (
              <span className="text-base md:text-lg font-semibold">
                Price unavailable
              </span>
            )}
          </div>
        </div>

        {/* Add to cart row */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AddToCartButton
              productId={activeVariation?.id ?? product.id}
              slug={product.slug}
              name={product.name}
              image={variationImageSrc}
              unitPrice={unitPrice}
              priceHtml={
                formattedSale || formattedRegular || "Price unavailable"
              }
              quantity={quantity}
              attributes={{
                size: effectiveSize,
                color: effectiveColor,
              }}
              weightKg={weightKg} // 👈 NEW: weight to cart
              onAddedToCart={onAddedToCart}
              disabled={!isInStock}
            />

            <div className="relative">
              <select
                className="
                  h-10 rounded-md border bg-background px-3 pr-8
                  text-xs font-medium
                "
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <WishlistButton
              item={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                regularPrice: regularPrice,
                salePrice: salePrice,
                onSale,
                image: variationImageSrc,
              }}
            />
          </div>

          {!isInStock && (
            <p className="text-xs text-destructive mt-1">
              This variant is currently out of stock.
            </p>
          )}

          {/* Rewards / loyalty block */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 px-3 py-2">
            <div className="mt-[3px] h-6 w-6 rounded-full bg-primary/10" />
            <div className="space-y-1">
              <p className="text-xs font-medium">
                Join Rewards to earn points on this purchase!
              </p>
              <p className="text-[11px] text-muted-foreground">
                <Link href="/account/register" className="underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link href="/account/login" className="underline">
                  sign in
                </Link>{" "}
                today.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile full-page link */}
        <div className="mt-2 flex md:hidden">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Get all the details.{" "}
            <span className="font-semibold underline">View full page</span>
          </Link>
        </div>
      </div>

      {isModal ? null : <ProductInfoSections product={product} />}
    </div>
  );
}
