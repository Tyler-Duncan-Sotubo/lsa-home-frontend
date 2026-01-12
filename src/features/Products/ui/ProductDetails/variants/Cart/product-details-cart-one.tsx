/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Rating } from "../../../../../reviews/ui/rating";
import { VariantSelectors } from "../../../ProductInfo/variant-selectors";
import { WishlistButton } from "../../../ProductInfo/wishlist-button";
import { AddToCartButton } from "../../../../../cart/add-to-cart-button";
import type { Product } from "@/features/Products/types/products";
import { ProductInfoSections } from "../../../ProductInfo/product-info-sections";
import { useMoney } from "@/shared/hooks/use-money";
import { LinkedProducts } from "../../../ProductInfo/linked-products";
import { useLinkedProductsQuery } from "@/features/Products/hooks/use-upsell-products";
import { LINK_COPY } from "@/shared/constants/link-copy";

export interface ProductDetailsPanelProps {
  product: Product;
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void; // sync with gallery
  isModal?: boolean; // if used in a modal/dialog
  onAddedToCart?: () => void;
  showInfoSections?: boolean;
}

// normalize helper for comparisons
const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

export function ProductDetailsCartOne({
  product,
  selectedColor,
  onSelectColor,
  isModal,
  onAddedToCart,
  showInfoSections = true,
}: ProductDetailsPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const formatMoney = useMoney();
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

  // IMPORTANT:
  // - ProductPageClient now initializes selectedColor on first render
  // - so this should already be stable from the start
  const effectiveColor = selectedColor ?? firstColor ?? null;

  // Resolve active variation based on selected size + color
  const activeVariation = useMemo(() => {
    const variations = product.variations ?? [];
    if (variations.length === 0) return null;

    const targetSize = norm(effectiveSize);
    const targetColor = norm(effectiveColor);

    const match = variations.find((v) => {
      const attrs = v.attributes ?? [];
      const sizeAttr = attrs.find((a) => a.name.toLowerCase().includes("size"));
      const colorAttr = attrs.find((a) =>
        a.name.toLowerCase().includes("color")
      );

      const sizeMatch = targetSize
        ? norm(sizeAttr?.option) === targetSize
        : true;

      const colorMatch = targetColor
        ? norm(colorAttr?.option) === targetColor
        : true;

      return sizeMatch && colorMatch;
    });

    return match ?? variations[0] ?? null;
  }, [product.variations, effectiveColor, effectiveSize]);

  const isInStock = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    if (vAny?.stock_status) return vAny.stock_status === "instock";
    if (pAny?.stock_status) return pAny.stock_status === "instock";
    return true;
  }, [activeVariation, product]);

  // Choose the image for the active variation, fallback to product image
  const variationImageSrc = useMemo(() => {
    const hero = product.images?.[0]?.src ?? null;
    if (!activeVariation) return hero;

    const av: any = activeVariation;
    const singleImageSrc = av.image?.src ?? av.image?.url ?? null;
    const galleryImageSrc = av.images?.[0]?.src ?? av.images?.[0]?.url ?? null;

    return singleImageSrc ?? galleryImageSrc ?? hero;
  }, [activeVariation, product.images]);

  // Normalize price info: regular / sale / onSale from variation or product
  const { regularPrice, salePrice, onSale } = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    const vRegular = vAny?.regular_price ?? null;
    const vSale = vAny?.sale_price ?? null;
    const vPrice = vAny?.price ?? null;
    const vOnSale = vAny?.on_sale ?? false;

    const pRegular = pAny?.regular_price ?? null;
    const pSale = pAny?.sale_price ?? null;
    const pPrice = pAny?.price ?? null;
    const pOnSale = pAny?.on_sale ?? false;

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

  const formattedRegular =
    regularPrice != null ? formatMoney(Number(regularPrice)) : null;

  const formattedSale =
    salePrice != null ? formatMoney(Number(salePrice)) : null;

  // Wrap onSelectColor so VariantSelectors always gets a function with correct type
  const handleSelectColor = (c: string) => onSelectColor?.(c);

  const { data: crossSells = [], isLoading: crossSellsLoading } =
    useLinkedProductsQuery(product.id, "cross_sell", true);
  const copy = LINK_COPY["cross_sell"];

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
          onSelectColor={handleSelectColor}
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
              slug={product.slug}
              quantity={quantity}
              onAddedToCart={onAddedToCart}
              disabled={!isInStock}
              variantId={activeVariation?.id as unknown as string}
              name={product.name}
              image={variationImageSrc}
              unitPrice={Number(salePrice ?? regularPrice ?? 0) ?? 0}
            />

            <div className="relative">
              <select
                className="h-10 rounded-md border bg-background px-3 pr-8 text-xs font-medium"
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
            <div className="mt-0.75 h-6 w-6 rounded-full bg-primary/10" />
            <div className="space-y-1">
              <p className="text-xs font-medium">
                Join Rewards to earn points on this purchase!
              </p>
              <p className="text-[11px] text-muted-foreground">
                <Link href="/register" className="underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link href="/login" className="underline">
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

      {showInfoSections && !isModal ? (
        <ProductInfoSections product={product} />
      ) : null}

      <LinkedProducts
        products={crossSells}
        loading={crossSellsLoading}
        title={copy.title}
        subtitle={copy.subtitle}
      />
    </div>
  );
}
