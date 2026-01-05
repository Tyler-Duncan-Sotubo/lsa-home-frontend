/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ProductGalleryProps } from "@/features/Pages/Products/types/products";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppSelector } from "@/store/hooks";
import { GalleryLayoutTwo } from "./gallery-layout-two";
import { GalleryLayoutOne } from "./gallery-layout-one";
import { GalleryLayoutThree } from "./gallery-layout-three";

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
  const variant = useAppSelector(
    (s) => s.runtimeConfig.ui.product.galleryVariant
  );
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

  useLayoutEffect(() => {
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

  switch (variant) {
    case "V2":
      return (
        <GalleryLayoutTwo
          images={galleryImages}
          activeIndex={safeActive}
          onSelect={setActiveImage}
          onPrev={goPrev}
          onNext={goNext}
          alt={product.name}
        />
      );
    case "V3":
      return (
        <GalleryLayoutThree
          images={galleryImages}
          activeIndex={safeActive}
          alt={product.name}
        />
      );
    default:
      return (
        <GalleryLayoutOne
          images={galleryImages}
          activeIndex={safeActive}
          onSelect={setActiveImage}
          onPrev={goPrev}
          onNext={goNext}
          alt={product.name}
        />
      );
  }

  return variant === "V2" ? (
    <GalleryLayoutTwo
      images={galleryImages}
      activeIndex={safeActive}
      onSelect={setActiveImage}
      onPrev={goPrev}
      onNext={goNext}
      alt={product.name}
    />
  ) : (
    <GalleryLayoutOne
      images={galleryImages}
      activeIndex={safeActive}
      onSelect={setActiveImage}
      onPrev={goPrev}
      onNext={goNext}
      alt={product.name}
    />
  );
}
