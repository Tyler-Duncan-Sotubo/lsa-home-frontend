"use client";

import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { ProductCard } from "@/features/products/ui/product-card";
import type { Product as WooProduct } from "@/features/products/types/products";
import { createStableKey } from "@/shared/utils/unique-key";

interface ProductRailProps {
  title?: string;
  subtitle?: string;
  products: WooProduct[];
  sectionClassName?: string;

  layout?: "rail" | "wrap"; // ✅ NEW
}

export function ProductRail({
  title,
  subtitle,
  products,
  sectionClassName = "w-full py-8",
  layout = "rail",
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

  const isWrap = layout === "wrap";

  console.log("Rendering ProductRail with products:", products);

  return (
    <section className={sectionClassName}>
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground capitalize">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Arrows only for rail layout */}
          {!isWrap && products.length > 3 && (
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

        {/* CONTENT */}

        {/* WRAP MODE (flex-wrap, responsive) */}
        {isWrap ? (
          <div
            className="
              flex flex-wrap gap-4
              sm:gap-5
              md:gap-6
            "
          >
            {products.map((product, idx) => {
              return (
                <div
                  key={createStableKey("product", product.id, "wrap", idx)}
                  className="
        w-[calc(33.333%-0.67rem)]
        sm:w-[calc(33.333%-0.84rem)]
        md:w-[calc(33.333%-1rem)]
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
              );
            })}
          </div>
        ) : (
          <>
            {/* MOBILE: 2-column grid */}
            <div className="grid grid-cols-2 gap-4 md:hidden">
              {products.map((product, index) => (
                <ProductCard
                  key={createStableKey("product", product.id, "mobile", index)}
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

            {/* DESKTOP: horizontal rail */}
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
                {products.map((product, idx) => (
                  <div
                    key={createStableKey("product", product?.id ?? "noid", idx)}
                    className="shrink-0 w-1/3"
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
          </>
        )}
      </div>
    </section>
  );
}
