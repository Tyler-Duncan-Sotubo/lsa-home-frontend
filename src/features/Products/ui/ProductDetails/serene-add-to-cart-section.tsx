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
  quantity: string;
  setQuantity: (qty: string) => void;
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

  // Always parse to number for logic — string only lives in the input
  const qtyNum = Math.max(1, Number(quantity) || 1);

  const hasStockTracking = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;
    return !!(vAny?.manage_stock || pAny?.manage_stock);
  }, [activeVariation, product]);

  const isPreOrder = useMemo(() => {
    if (!isInStock) return true;
    if (hasStockTracking && qtyNum > maxQty) return true;
    return false;
  }, [isInStock, hasStockTracking, qtyNum, maxQty]);

  const canAddToCart = !isPreOrder;

  const stockMessage = useMemo(() => {
    if (!isInStock) {
      return {
        text: "This variant is out of stock — submit a preorder request.",
        color: "text-muted-foreground",
      };
    }
    if (hasStockTracking && qtyNum > maxQty) {
      return {
        text: `Only ${maxQty} in stock — submit a quote for the remaining ${qtyNum - maxQty}.`,
        color: "text-muted-foreground",
      };
    }
    if (hasStockTracking && maxQty > 0 && maxQty <= 10) {
      return {
        text: `Only ${maxQty} left`,
        color: "text-[11px] text-muted-foreground",
      };
    }
    return null;
  }, [isInStock, hasStockTracking, qtyNum, maxQty]);

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
        quantity: qtyNum,
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
      value: (Number(product.price) || 0) * qtyNum,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_variant: effectiveColor ?? undefined,
          price: product.price ?? 0,
          quantity: qtyNum,
        },
      ],
    });

    onAddedToCart?.();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Preorder banner — only when variant is fully out of stock */}
      {!isInStock && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-primary">Preorder</p>
            <p className="text-xs text-muted-foreground">
              This variant is out of stock but available for preorder.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {isPreOrder ? (
          <Button onClick={handleRequestQuote} className="flex-1" type="button">
            {!isInStock ? "Preorder" : "Pre-order / Request Quote"}
          </Button>
        ) : (
          <AddToCartButton
            slug={product.slug}
            quantity={qtyNum}
            onAddedToCart={onAddedToCart}
            disabled={!canAddToCart}
            variantId={activeVariation?.id as unknown as string}
            name={product.name}
            image={variationImageSrc}
            unitPrice={Number(salePrice ?? regularPrice ?? 0)}
            maxQty={maxQty}
          />
        )}

        {/* String value in input, parsed to number only for logic */}
        <div className="relative">
          <input
            type="number"
            min={1}
            max={SERENE_MAX_QTY}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={(e) => {
              const val = Math.min(
                SERENE_MAX_QTY,
                Math.max(1, Number(e.target.value) || 1),
              );
              setQuantity(String(val));
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

      {stockMessage && (
        <p className={`text-xs mt-1 ${stockMessage.color}`}>
          {stockMessage.text}
        </p>
      )}

      <div className="flex items-start gap-3 rounded-lg bg-muted/60 px-3 py-2">
        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 shrink-0" />
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
