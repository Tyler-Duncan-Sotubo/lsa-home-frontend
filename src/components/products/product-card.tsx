/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/products/reviews/rating";
import { WishlistButton } from "@/components/products/wishlist-button";
import { useAppDispatch } from "@/store/hooks";
import { addRecentlyViewed } from "@/store/recentlyViewedSlice";
import { QuickViewDialog } from "../modals/quick-view-modal";
import { formatNaira } from "@/utils/format-naira";
import { cleanPriceHtml } from "@/utils/cleanPriceHtml";

export interface ProductCardProps {
  id: number | string;
  name: string;
  slug?: string;
  permalink?: string;
  imageSrc?: string | null;
  priceHtml?: string | null; // 👈 bring this back
  averageRating?: number;
  ratingCount?: number;
  tagLabel?: string;
  quickViewProduct?: any;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  imageSrc,
  priceHtml,
  averageRating = 0,
  ratingCount = 0,
  tagLabel,
  quickViewProduct,
  regularPrice,
  salePrice,
  onSale,
}: ProductCardProps) {
  const href = slug ? `/products/${slug}` : "#";
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const dispatch = useAppDispatch();

  const hasQuickView = Boolean(quickViewProduct);
  const cleanedHtml = cleanPriceHtml(priceHtml);

  // Numeric formatting (for simple products / when we have explicit prices)
  const regular = formatNaira(regularPrice);
  const sale = formatNaira(salePrice);

  const handleMarkRecentlyViewed = useCallback(() => {
    dispatch(
      addRecentlyViewed({
        id,
        slug,
        name,
        regularPrice: regularPrice ?? null,
        salePrice: salePrice ?? null,
        onSale: onSale ?? false,
        image: imageSrc ?? null,
        priceHtml: priceHtml ?? null,
      })
    );
  }, [
    dispatch,
    id,
    slug,
    name,
    regularPrice,
    salePrice,
    onSale,
    imageSrc,
    priceHtml,
  ]);

  return (
    <>
      <article
        className="
          group
          flex flex-col
          w-full
          bg-background
          overflow-hidden
          transition
          hover:-translate-y-1
        "
      >
        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden">
          {tagLabel && (
            <span
              className="
                absolute left-3 top-3 z-10
                px-3 py-1
                rounded-full
                bg-background/90
                text-[11px] font-medium uppercase
                text-muted-foreground
              "
            >
              {tagLabel}
            </span>
          )}

          <Link href={href} onClick={handleMarkRecentlyViewed}>
            <Image
              src={imageSrc ?? "/placeholder.png"}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {hasQuickView && (
            <div
              className="
                absolute inset-x-0 bottom-0
                opacity-0 translate-y-full
                transition
                group-hover:opacity-100 group-hover:translate-y-0
              "
            >
              <Button
                className="
                  pointer-events-auto
                  w-full
                  bg-none
                  p-5
                  text-sm font-medium
                  text-center
                  rounded-none
                  cursor-pointer
                  gap-2
                "
                variant="outline"
                type="button"
                onClick={() => setQuickViewOpen(true)}
              >
                <FaPlus />
                Quick view
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={href}
              className="flex-1"
              onClick={handleMarkRecentlyViewed}
            >
              <h3 className="text-sm md:text-base font-medium line-clamp-2">
                {name}
              </h3>
            </Link>

            <WishlistButton
              item={{
                id,
                slug,
                name,
                regularPrice,
                salePrice,
                onSale,
                priceHtml, // 👈 add this if you have it
                image: imageSrc ?? null,
                rating: averageRating,
                reviews: ratingCount,
              }}
            />
          </div>

          {/* Price block */}
          {sale && regular ? (
            // We have explicit numeric prices → show them
            <div className="flex items-center gap-2 text-sm">
              <span className="line-through text-muted-foreground">
                {regular}
              </span>
              <span className="text-primary font-semibold">{sale}</span>
            </div>
          ) : regular ? (
            <p className="text-xs md:text-sm font-semibold text-foreground">
              {regular}
            </p>
          ) : priceHtml ? (
            // Fallback: WooCommerce price_html (works well for variable products)
            <div
              className="text-xs md:text-sm font-semibold text-foreground"
              dangerouslySetInnerHTML={{ __html: cleanedHtml ?? "" }}
            />
          ) : null}

          <Rating rating={averageRating} reviews={ratingCount} />
        </div>
      </article>

      {hasQuickView && (
        <QuickViewDialog
          open={quickViewOpen}
          product={quickViewProduct}
          onOpenChange={setQuickViewOpen}
        />
      )}
    </>
  );
}
