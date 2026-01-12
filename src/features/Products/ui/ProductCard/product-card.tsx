/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/shared/ui/button";
// import { Rating } from "@/features/reviews/ui/rating";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRecentlyViewed } from "@/store/recentlyViewedSlice";
import { QuickViewDialog } from "../ProductQuickView/quick-view-modal";

import dynamic from "next/dynamic";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import { useCanSeePrice } from "@/shared/hooks/use-can-see-price";

const WishlistButton = dynamic(
  () =>
    import("@/features/Products/ui/ProductInfo/wishlist-button").then(
      (m) => m.WishlistButton
    ),
  { ssr: false }
);

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
  size?: "compact" | "default" | "large";
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
  size = "default",
}: ProductCardProps) {
  const href = slug ? `/products/${slug}` : "#";
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const dispatch = useAppDispatch();
  const formatPrice = usePriceDisplay();
  const { canSee, rule, isLoggedIn } = useCanSeePrice();
  const hasQuickView = Boolean(quickViewProduct);
  const priceHtmlFormatted = formatPrice(priceHtml);
  const regularFormatted = formatPrice(regularPrice);
  const saleFormatted = formatPrice(salePrice);

  const showWishListButton = useAppSelector(
    (s) => s.runtimeConfig.ui.product.showWishlistButton
  );

  const priceClass =
    size === "compact"
      ? "text-xs md:text-sm"
      : size === "large"
      ? "text-sm md:text-sm"
      : "text-sm md:text-sm";

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
        averageRating: averageRating,
        ratingCount: ratingCount,
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
    averageRating,
    ratingCount,
  ]);

  // Sales badge logic can be added here if needed

  const discountPercent =
    onSale && regularPrice && salePrice
      ? Math.round(
          ((Number(regularPrice) - Number(salePrice)) / Number(regularPrice)) *
            100
        )
      : null;

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
                bg-background/90 text-xs
                md:text-[9px] text-[8px] font-medium uppercase
                text-muted-foreground
              "
            >
              {tagLabel}
            </span>
          )}

          {discountPercent && discountPercent > 0 && (
            <span
              className="
      absolute right-3 top-3 z-10
      px-3 py-1
      rounded-full
      bg-destructive text-primary-foreground
      text-xs md:text-[15px] text-[9px]
      font-bold
      shadow
    "
            >
              -{discountPercent}%
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
                absolute inset-x-0 bottom-0 bg-secondary
                opacity-0 translate-y-full
                transition
                group-hover:opacity-100 group-hover:translate-y-0
              "
            >
              <Button
                className="
                  pointer-events-auto
                  w-full
                  bg-secondary
                  text-primary
                  hover:bg-secondary
                  hover:text-primary
                  p-5
                  text-sm font-bold
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
              <h3
                className={`${priceClass} font-semibold text-foreground line-clamp-2 mt-4`}
              >
                {name}
              </h3>
            </Link>

            {showWishListButton && (
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
            )}
          </div>

          {canSee ? (
            /* ================= PRICE VISIBLE ================= */
            priceHtmlFormatted ? (
              <p className={`${priceClass} font-semibold text-foreground`}>
                {priceHtmlFormatted}
              </p>
            ) : saleFormatted && regularFormatted ? (
              <div className={`flex items-center gap-2 text-lg ${priceClass} `}>
                <span className="line-through text-muted-foreground">
                  {regularFormatted}
                </span>
                <span className="text-primary font-semibold">
                  {saleFormatted}
                </span>
              </div>
            ) : regularFormatted ? (
              <p className="text-xs md:text-lg font-semibold text-foreground">
                {regularFormatted}
              </p>
            ) : (
              <p className="text-xs md:text-lg font-semibold text-foreground">
                Price unavailable
              </p>
            )
          ) : (
            /* ================= PRICE HIDDEN ================= */
            <div className="rounded-lg">
              {rule === "loggedInOnly" && !isLoggedIn ? (
                <p className="text-[14px] text-muted-foreground">
                  <Link href="/account/login" className="underline font-medium">
                    Login
                  </Link>{" "}
                  to see pricing.
                </p>
              ) : (
                <div>
                  <p className="text-[14px] font-medium text-foreground">
                    Pricing
                  </p>
                  <p className="text-[14px] text-muted-foreground">
                    Pricing is provided via quote based on your selections and
                    quantity.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* <Rating rating={averageRating} reviews={ratingCount} /> */}
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
