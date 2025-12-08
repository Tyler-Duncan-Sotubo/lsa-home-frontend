// src/components/products/product-rail.tsx
"use client";

import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { ProductCard } from "@/components/products/product-card";
import type { Product as WooProduct } from "@/types/products";

interface ProductRailProps {
  title?: string;
  subtitle?: string;
  products: WooProduct[];
  sectionClassName?: string;
}

export function ProductRail({
  title,
  subtitle,
  products,
  sectionClassName = "w-full py-8",
}: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (dir: "left" | "right") => {
    if (!trackRef.current) return;

    const trackWidth = trackRef.current.clientWidth;
    const cardWidth = trackWidth / 3;

    trackRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className={sectionClassName}>
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Arrows only on desktop */}
          {products.length > 3 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                className="flex h-9 w-9 items-center justify-center bg-background/80 transition cursor-pointer"
                aria-label={`Previous in ${title}`}
              >
                <FaChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                className="flex h-9 w-9 items-center justify-center bg-background/80 transition cursor-pointer"
                aria-label={`Next in ${title}`}
              >
                <FaChevronRight className="h-7 w-7" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile: 2-column grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              permalink={product.permalink}
              imageSrc={product.images?.[0]?.src}
              priceHtml={product.price_html}
              averageRating={Number(product.average_rating ?? 0)}
              ratingCount={product.rating_count ?? 0}
              tagLabel={product.tags?.[0]?.name}
              quickViewProduct={product}
              regularPrice={product.regular_price}
              salePrice={product.sale_price}
              onSale={product.on_sale}
            />
          ))}
        </div>

        {/* Desktop: horizontal rail */}
        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute left-0 inset-y-0 w-10 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 inset-y-0 w-10 bg-linear-to-l from-background to-transparent" />

          <div
            ref={trackRef}
            className="
              flex gap-6 overflow-hidden scroll-smooth pb-3
              [&::-webkit-scrollbar]:hidden
              [-ms-overflow-style:'none']
              [scrollbar-width:'none']
            "
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  shrink-0
                  w-1/3
                  lg:w-1/4
                "
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  permalink={product.permalink}
                  imageSrc={product.images?.[0]?.src}
                  priceHtml={product.price_html}
                  averageRating={Number(product.average_rating ?? 0)}
                  ratingCount={product.rating_count ?? 0}
                  tagLabel={product.tags?.[0]?.name}
                  quickViewProduct={product}
                  regularPrice={product.regular_price}
                  salePrice={product.sale_price}
                  onSale={product.on_sale}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
