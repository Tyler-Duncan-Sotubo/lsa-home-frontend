/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaEye } from "react-icons/fa6";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/shared/ui/button";
// import { Rating } from "@/features/reviews/ui/rating";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRecentlyViewed } from "@/store/recentlyViewedSlice";
import { QuickViewDialog } from "../ProductQuickView/quick-view-modal";
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
  priceHtml?: string | null;
  averageRating?: number;
  ratingCount?: number;
  tagLabel?: string;
  quickViewProduct?: any;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  size?: "compact" | "default" | "large";
}

export function ProductCardHoverActions({
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
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

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
        averageRating,
        ratingCount,
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

  const discountPercent =
    onSale && regularPrice && salePrice
      ? Math.round(
          ((Number(regularPrice) - Number(salePrice)) / Number(regularPrice)) *
            100
        )
      : null;

  const showDiscount = Boolean(discountPercent && discountPercent > 0);

  // If discount exists, don't show tagLabel
  const showTagLabel = Boolean(tagLabel) && !showDiscount;

  const priceClass =
    size === "compact"
      ? "text-xs md:text-sm"
      : size === "large"
      ? "text-sm md:text-lg"
      : "text-sm md:text-base";

  return (
    <>
      <article
        className="
          group flex flex-col w-full bg-background overflow-hidden transition
          hover:-translate-y-1 mt-10
        "
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden">
          {showTagLabel && (
            <span
              className="
                absolute left-3 top-3 z-10 px-3 py-1 rounded-full
                bg-background/90 text-xs md:text-[9px] text-[8px]
                font-medium uppercase text-muted-foreground
              "
            >
              {tagLabel}
            </span>
          )}

          {showDiscount && (
            <span
              className="
      absolute left-3 top-3 z-10 px-3 py-1 rounded-full
      bg-destructive text-primary-foreground text-xs md:text-[15px] text-[9px]
      font-bold shadow
    "
            >
              -{discountPercent}%
            </span>
          )}

          <Link href={href} onClick={handleMarkRecentlyViewed}>
            <Image
              src={
                imageSrc ??
                "https://centa-hr.s3.amazonaws.com/019bbc22-ee74-7bfa-a6af-0a801a3d2e24/no-image.jpeg"
              }
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Soft overlay */}
          <motion.div
            className="absolute inset-0 z-10 bg-background/10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />

          {/* Icons: slide in from right */}
          <motion.div
            className="absolute right-3 z-20 flex flex-col gap-2 pointer-events-auto"
            style={{ top: 12 }} // ~top-14 / top-3 in px
            initial={false}
            animate={
              reduceMotion
                ? { opacity: hovered ? 1 : 0 }
                : {
                    opacity: hovered ? 1 : 0,
                    x: hovered ? 0 : 24, // from right
                  }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {showWishListButton && (
              <div className="rounded-full bg-background/90 shadow">
                <WishlistButton
                  item={{
                    id,
                    slug,
                    name,
                    regularPrice,
                    salePrice,
                    onSale,
                    priceHtml,
                    image: imageSrc ?? null,
                    rating: averageRating,
                    reviews: ratingCount,
                  }}
                />
              </div>
            )}

            {hasQuickView && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/90 shadow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                aria-label="Quick view"
              >
                <FaEye />
              </Button>
            )}
          </motion.div>

          {/* CTA button: reveal from bottom */}
          <motion.div
            className="absolute inset-x-3 bottom-3 z-20 pointer-events-auto"
            initial={false}
            animate={
              reduceMotion
                ? { opacity: hovered ? 1 : 0 }
                : {
                    opacity: hovered ? 1 : 0,
                    y: hovered ? 0 : 16, // from bottom
                  }
            }
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          >
            <Button variant="clean" asChild className="w-full font-semibold">
              <Link href={href} onClick={handleMarkRecentlyViewed}>
                Select options
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-1 flex flex-col gap-2">
          <Link
            href={href}
            className="flex-1"
            onClick={handleMarkRecentlyViewed}
          >
            <h3
              className={`${priceClass} font-semibold text-foreground line-clamp-1 mt-4`}
            >
              {name}
            </h3>
          </Link>

          {canSee ? (
            priceHtmlFormatted ? (
              <p className={`${priceClass} font-semibold text-foreground`}>
                {priceHtmlFormatted}
              </p>
            ) : saleFormatted && regularFormatted ? (
              <div className={`flex items-center gap-2 text-lg ${priceClass} `}>
                <span className="text-primary font-semibold">
                  {saleFormatted}
                </span>
                <span className="line-through text-muted-foreground">
                  {regularFormatted}
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
