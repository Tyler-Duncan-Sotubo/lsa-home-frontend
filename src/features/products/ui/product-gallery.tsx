/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ProductGalleryProps } from "@/features/products/types/products";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

interface GalleryProps extends ProductGalleryProps {
  selectedColor?: string | null;
}

const norm = (s?: string | null) =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, "");

function isColorAttrName(name?: string | null) {
  const n = norm(name);
  return n.includes("color") || n.includes("colour");
}

function getVariationColor(v: any) {
  const attrs: any[] = v?.attributes ?? [];
  const hit = attrs.find((a) => isColorAttrName(a?.name));
  return (hit?.option ?? "").toString();
}

function productHasAnyColor(product: any) {
  // check product-level attributes
  const pAttrs: any[] = product?.attributes ?? [];
  if (pAttrs.some((a) => isColorAttrName(a?.name))) return true;

  // check variation-level attributes
  const vars: any[] = product?.variations ?? [];
  return vars.some((v) =>
    (v?.attributes ?? []).some((a: any) => isColorAttrName(a?.name))
  );
}

export function ProductGallery({ product, selectedColor }: GalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const lastColorRef = useRef<string | null>(null);

  const hasColor = useMemo(() => productHasAnyColor(product), [product]);

  const galleryImages = useMemo(() => {
    const hero = product.images?.[0]?.src ?? null;

    const srcSet = new Set<string>();
    const out: string[] = [];

    const pushSrc = (src?: string | null) => {
      if (!src) return;
      if (!srcSet.has(src)) {
        srcSet.add(src);
        out.push(src);
      }
    };

    // 1) always include hero first
    pushSrc(hero);

    const variations: any[] = product.variations ?? [];

    if (hasColor) {
      // ✅ Color-based products: keep ONE image per color (avoid duplicates across sizes)
      const colorToSrc = new Map<string, string>();

      for (const v of variations) {
        const color = norm(getVariationColor(v));
        const src = v?.image?.src ?? null;
        if (!color || !src) continue;

        if (!colorToSrc.has(color)) colorToSrc.set(color, src);
      }

      for (const src of colorToSrc.values()) pushSrc(src);
    } else {
      // ✅ No color attribute (e.g. Size-only): include variation images anyway
      for (const v of variations) {
        const src = v?.image?.src ?? null;
        pushSrc(src);
      }
    }

    return out.length ? out : ["/placeholder.png"];
  }, [product.images, product.variations, hasColor]);

  const clampActiveImage = useEffectEvent((len: number) => {
    setActiveImage((i) => Math.max(0, Math.min(i, len - 1)));
  });

  useEffect(() => {
    clampActiveImage(galleryImages.length);
  }, [galleryImages.length]);

  // ✅ Only try to sync by selectedColor when the product actually has color
  const syncSelectedColor = useEffectEvent((color?: string | null) => {
    if (!hasColor) return;
    if (!color) return;

    const normalized = norm(color);
    if (lastColorRef.current === normalized) return;
    lastColorRef.current = normalized;

    const match = (product.variations ?? []).find((v: any) => {
      const vColor = norm(getVariationColor(v));
      return vColor === normalized && !!v?.image?.src;
    });

    const src = match?.image?.src;
    if (!src) return;

    const idx = galleryImages.indexOf(src);
    if (idx !== -1) setActiveImage(idx);
  });

  useEffect(() => {
    syncSelectedColor(selectedColor);
  }, [selectedColor]);

  const safeActive = Math.min(activeImage, galleryImages.length - 1);

  const goPrev = () => {
    setActiveImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveImage((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative border-b md:border-b-0 md:h-[650px]">
      <div className="flex h-full">
        {/* Thumbs (desktop) */}
        <aside className="hidden md:flex flex-col gap-3 p-2 w-18 shrink-0 overflow-y-auto">
          {galleryImages.slice(0, 9).map((src, index) => (
            <button
              key={`${src}-${index}`}
              onClick={() => setActiveImage(index)}
              className={`relative w-full aspect-square overflow-hidden ${
                index === safeActive
                  ? "ring-2 ring-foreground"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </aside>

        {/* Main image area */}
        <div className="relative flex-1 flex items-center justify-center p-2">
          <div className="relative w-full h-[400px] md:h-[650px] overflow-hidden">
            <Image
              src={galleryImages[safeActive] || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {galleryImages.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow hover:bg-background"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow hover:bg-background"
              >
                <FaArrowRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
