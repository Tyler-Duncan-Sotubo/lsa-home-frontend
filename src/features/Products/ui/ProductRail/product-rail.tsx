"use client";

import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import type { Product as WooProduct } from "@/features/Products/types/products";
import { createStableKey } from "@/shared/utils/unique-key";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { ProductCardSwitch } from "../ProductCard/product-card-switch";

interface ProductRailProps {
  title?: string;
  subtitle?: string;
  products: WooProduct[];
  sectionClassName?: string;
  collections?: string;
  layout?: "rail" | "wrap"; // ✅ NEW
}

export function ProductRail({
  title,
  subtitle,
  products,
  sectionClassName = "w-full py-8",
  collections,
  layout = "rail",
}: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(":scope > div");
    if (!firstCard) return;

    const gap = parseFloat(getComputedStyle(track).gap || "0");
    const step = firstCard.getBoundingClientRect().width + gap;

    track.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  const isWrap = layout === "wrap";

  return (
    <section className={sectionClassName}>
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-secondary-foreground capitalize">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {collections && (
              <Button variant={"clean"} asChild className="mt-4">
                <Link href={`/collections/${collections}`}>Shop All</Link>
              </Button>
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
              flex flex-wrap gap-8
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
                  <ProductCardSwitch
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
                    size="large"
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
                <ProductCardSwitch
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
                  size="compact"
                />
              ))}
            </div>

            {/* DESKTOP: horizontal rail */}
            <div className="relative hidden md:block">
              <div className="pointer-events-none absolute left-0 inset-y-0 w-10 bg-linear-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute right-0 inset-y-0 w-10 bg-linear-to-l from-background to-transparent" />

              <div
                ref={trackRef}
                style={{ scrollbarWidth: "none" }} // Firefox hard kill
                className="flex gap-6 pb-3 overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent"
              >
                {products.map((product, idx) => (
                  <div
                    key={createStableKey("product", product?.id ?? "noid", idx)}
                    className="shrink-0 w-[calc((100%-3rem)/3)]"
                  >
                    <ProductCardSwitch
                      id={product.id}
                      size="default"
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
