"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";

export type LinkedProduct = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  price_html: string;
  on_sale?: boolean;
};

type Props = {
  products: LinkedProduct[];
  loading?: boolean;

  title?: string;
  subtitle?: string;

  /** Optional hook (e.g. close sheet on click) */
  onItemClick?: () => void;
};

export function LinkedProducts({
  products,
  loading = false,
  title,
  subtitle,
  onItemClick,
}: Props) {
  const formatPrice = usePriceDisplay();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isScrollable = products.length > 1;

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;

    // small tolerance for fractional pixels
    setCanScrollLeft(left > 2);
    setCanScrollRight(left < maxScrollLeft - 2);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    // update on resize too (Sheet width changes)
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
    // re-run when products change so scrollWidth updates
  }, [products.length]);

  const scrollByOne = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    // Each card is full width of the scroller viewport (one-per-view)
    const amount = el.clientWidth;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div className="mt-8 hidden md:block">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? <p className="text-sm font-semibold">{title}</p> : null}
              {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            {/* Real scroll controls (only when useful) */}
            {isScrollable ? (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="clean"
                  size="sm"
                  onClick={() => scrollByOne("left")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left"
                  className="h-8 w-8 px-0"
                >
                  ←
                </Button>
                <Button
                  type="button"
                  variant="clean"
                  size="sm"
                  onClick={() => scrollByOne("right")}
                  disabled={!canScrollRight}
                  aria-label="Scroll right"
                  className="h-8 w-8 px-0"
                >
                  →
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* One-per-view scroller */}
        <div className="-mx-4 px-4">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge legacy
            }}
          >
            {/* Hide scrollbar (WebKit) */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                onClick={onItemClick}
                className="group w-full shrink-0 snap-start rounded-xl border p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  {/* Image */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={p.image ?? "/placeholder.png"}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold group-hover:underline">
                      {p.name}
                    </p>
                    <div className="mt-1 text-xs font-semibold text-foreground">
                      {formatPrice(p.price_html)}
                    </div>
                  </div>

                  {p.on_sale ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Sale
                    </Badge>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-3">
        {(title || subtitle) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? <p className="text-sm font-semibold">{title}</p> : null}
              {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
        )}
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            onClick={onItemClick}
            className="
              flex items-center gap-3
              rounded-xl border
              p-3
              transition
              active:scale-[0.99]
            "
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={p.image ?? "/placeholder.png"}
                alt={p.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <div className="mt-1 text-xs font-semibold text-foreground">
                {formatPrice(p.price_html)}
              </div>
            </div>

            {p.on_sale ? (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                Sale
              </Badge>
            ) : null}
          </Link>
        ))}
      </div>
    </>
  );
}
