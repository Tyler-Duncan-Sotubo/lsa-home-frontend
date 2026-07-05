"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import type { Product } from "@/features/Products/types/products";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { QuickViewDialog } from "@/features/Products/ui/ProductQuickView/quick-view-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

function UpsellCard({ product }: { product: Product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const formatPrice = usePriceDisplay();
  const href = `/products/${product.slug}`;

  const variationAttrs = useMemo(
    () => (product.attributes ?? []).filter((a) => a.variation),
    [product.attributes],
  );
  const variations = product.variations ?? [];

  const singleAttr = variationAttrs.length === 1 ? variationAttrs[0] : null;
  const hasComplexVariants = variations.length > 0 && !singleAttr;

  const [selectedOption, setSelectedOption] = useState<string | null>(
    singleAttr?.options?.[0] ?? null,
  );

  const selectedVariation = singleAttr
    ? variations.find((v) =>
        v.attributes.some(
          (a) => a.name === singleAttr.name && a.option === selectedOption,
        ),
      )
    : null;

  const image =
    selectedVariation?.image?.src ?? product.images?.[0]?.src ?? null;

  const priceFormatted = selectedVariation
    ? formatPrice(selectedVariation.price ?? selectedVariation.regular_price)
    : (formatPrice(product.price_html) ?? formatPrice(product.price));

  return (
    <>
      <div className="p-4 border rounded-xl bg-card">
        <div className="flex items-start gap-4">
          <Link
            href={href}
            className="relative block w-20 h-20 overflow-hidden rounded-lg shrink-0 bg-muted"
          >
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                No image
              </div>
            )}
          </Link>

          <div className="flex items-start justify-between flex-1 min-w-0 gap-3">
            <div className="min-w-0">
              <Link
                href={href}
                className="text-sm font-medium line-clamp-1 hover:underline"
              >
                {product.name}
              </Link>
              {product.short_description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {product.short_description}
                </p>
              )}
            </div>

            {priceFormatted && (
              <span className="text-sm font-semibold shrink-0">
                {priceFormatted}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {singleAttr && (
            <Select
              value={selectedOption ?? undefined}
              onValueChange={setSelectedOption}
            >
              <SelectTrigger className="flex-1 text-xs h-9">
                <SelectValue placeholder={singleAttr.name} />
              </SelectTrigger>
              <SelectContent>
                {singleAttr.options.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasComplexVariants ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setQuickViewOpen(true)}
              className={cn(
                "h-9 shrink-0 px-4 text-xs",
                !singleAttr && "ml-auto",
              )}
            >
              Add
            </Button>
          ) : (
            // Wrapped in a non-flex container so AddToCartButton's own
            // hardcoded `flex-1` (it always stretches inside a flex parent)
            // doesn't fight the "hug the right edge" sizing here.
            <div className={cn("shrink-0", !singleAttr && "ml-auto")}>
              <AddToCartButton
                slug={product.slug}
                name={product.name}
                image={image}
                variantId={
                  selectedVariation
                    ? (selectedVariation.id as unknown as string)
                    : undefined
                }
                unitPrice={Number(
                  selectedVariation?.price ??
                    selectedVariation?.regular_price ??
                    product.price ??
                    0,
                )}
                maxQty={
                  selectedVariation?.stock_quantity ??
                  product.stock_quantity ??
                  null
                }
                description={product.short_description}
                attributes={
                  singleAttr && selectedOption
                    ? { [singleAttr.name]: selectedOption }
                    : undefined
                }
                disabled={Boolean(singleAttr) && !selectedVariation}
                size="sm"
                className="px-4 text-xs h-9"
              />
            </div>
          )}
        </div>
      </div>

      {hasComplexVariants && (
        <QuickViewDialog
          open={quickViewOpen}
          product={product}
          onOpenChange={setQuickViewOpen}
        />
      )}
    </>
  );
}

export function CartUpsellRail({
  title,
  products,
  className,
}: {
  title: string;
  products: Product[];
  className?: string;
}) {
  const picks = products.slice(0, 2);
  const [index, setIndex] = useState(0);

  if (!picks.length) return null;

  const canNav = picks.length > 1;
  const activeIndex = index % picks.length;
  const activeProduct = picks[activeIndex];

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + picks.length) % picks.length);

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium">{title}</p>

        {canNav && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous product"
              onClick={() => go(-1)}
              className="flex items-center justify-center transition rounded-full h-7 w-7 hover:bg-muted"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              aria-label="Next product"
              onClick={() => go(1)}
              className="flex items-center justify-center transition rounded-full h-7 w-7 hover:bg-muted"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <UpsellCard key={activeProduct.id} product={activeProduct} />
    </section>
  );
}
