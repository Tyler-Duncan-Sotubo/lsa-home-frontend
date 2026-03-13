/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppDispatch } from "@/store/hooks";
import { addToQuote } from "@/store/quoteSlice";
import { Button } from "@/shared/ui/button";
import { gaEvent } from "@/features/integrations/config/ga";
import type { Product } from "@/features/Products/types/products";
import { useMemo } from "react";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { WishlistButton } from "../ProductInfo/wishlist-button";
import Link from "next/link";

interface SereneAddToCartSectionProps {
  product: Product;
  activeVariation: any | null;
  quantity: number;
  setQuantity: (qty: number) => void;
  maxQty: number;
  isInStock: boolean;
  regularPrice: string | null;
  salePrice: string | null;
  onSale: boolean;
  variationImageSrc: string | null;
  effectiveColor: string | null;
  effectiveSize: string | null;
  selectedExtras: Partial<Record<string, string | null>>;
  onAddedToCart?: () => void;
}

const SERENE_MAX_QTY = 1000;

export function SereneAddToCartSection({
  product,
  activeVariation,
  quantity,
  setQuantity,
  maxQty,
  isInStock,
  regularPrice,
  salePrice,
  variationImageSrc,
  effectiveColor,
  effectiveSize,
  selectedExtras,
  onAddedToCart,
}: SereneAddToCartSectionProps) {
  const dispatch = useAppDispatch();

  // When manage_stock is off / no stock data, treat as unlimited — never show pre-order
  const hasStockTracking = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;
    return !!(vAny?.manage_stock || pAny?.manage_stock);
  }, [activeVariation, product]);

  // Switch to pre-order only when stock is tracked AND user wants more than available
  const isPreOrder = hasStockTracking && isInStock && quantity > maxQty;

  // Still fully out of stock → normal disabled state
  const canAddToCart = isInStock && !isPreOrder;

  const buildAttributes = (): Record<string, string | null> => {
    const out: Record<string, string | null> = {};
    if (effectiveSize) out["Size"] = effectiveSize;
    if (effectiveColor) out["Color"] = effectiveColor;

    for (const [key, val] of Object.entries(selectedExtras)) {
      if (val) out[key] = val;
    }

    const attrs = (activeVariation as any)?.attributes ?? [];
    for (const a of attrs) {
      const key = a?.name ? String(a.name) : null;
      const val = a?.option ? String(a.option) : null;
      if (key) out[key] = val;
    }

    return out;
  };

  const buildVariantLabel = () => {
    const parts: string[] = [];
    if (effectiveSize) parts.push(`Size: ${effectiveSize}`);
    if (effectiveColor) parts.push(`Color: ${effectiveColor}`);
    for (const [key, val] of Object.entries(selectedExtras)) {
      if (val) parts.push(`${key}: ${val}`);
    }
    return parts.length ? parts.join(" · ") : undefined;
  };

  const handleRequestQuote = () => {
    dispatch(
      addToQuote({
        slug: product.slug,
        productId: String((product as any)?.id),
        variantId: activeVariation?.id ? String(activeVariation.id) : null,
        quantity,
        name: product.name,
        moq: product.moq,
        variantLabel: buildVariantLabel(),
        image: variationImageSrc ?? null,
        attributes: buildAttributes(),
        price: activeVariation?.price ? Number(activeVariation.price) : null,
      }),
    );

    gaEvent("add_to_cart", {
      currency: "NGN",
      value: (Number(product.price) || 0) * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_variant: effectiveColor ?? undefined,
          price: product.price ?? 0,
          quantity,
        },
      ],
    });

    onAddedToCart?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {/* Button swaps reactively based on quantity vs stock */}
        {isPreOrder ? (
          <Button onClick={handleRequestQuote} className="flex-1" type="button">
            Pre-order / Request Quote
          </Button>
        ) : (
          <AddToCartButton
            slug={product.slug}
            quantity={quantity}
            onAddedToCart={onAddedToCart}
            disabled={!canAddToCart}
            variantId={activeVariation?.id as unknown as string}
            name={product.name}
            image={variationImageSrc}
            unitPrice={Number(salePrice ?? regularPrice ?? 0)}
            maxQty={maxQty}
          />
        )}

        {/* Uncapped qty selector for Serene */}
        <div className="relative">
          <input
            type="number"
            min={1}
            max={SERENE_MAX_QTY}
            value={quantity}
            disabled={!isInStock}
            onChange={(e) => {
              const val = Math.min(
                SERENE_MAX_QTY,
                Math.max(1, Number(e.target.value) || 1),
              );
              setQuantity(val);
            }}
            className="h-10 w-20 rounded-md border bg-background px-3 text-xs font-medium"
          />
        </div>

        <WishlistButton
          item={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            regularPrice,
            salePrice,
            onSale: false,
            image: variationImageSrc,
          }}
        />
      </div>

      {/* Stock / pre-order messaging */}
      {!isInStock ? (
        <p className="text-xs text-destructive mt-1">
          This variant is currently out of stock.
        </p>
      ) : isPreOrder ? (
        <p className="text-xs text-muted-foreground mt-1">
          Only {maxQty} in stock — submit a quote request for the remaining{" "}
          {quantity - maxQty}.
        </p>
      ) : hasStockTracking && maxQty > 0 && maxQty <= 10 ? (
        <p className="text-[11px] text-muted-foreground mt-1">
          Only {maxQty} left
        </p>
      ) : null}

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
  );
}
