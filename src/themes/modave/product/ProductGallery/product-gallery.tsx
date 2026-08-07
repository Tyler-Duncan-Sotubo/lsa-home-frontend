/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ProductGalleryProps } from "@/features/Products/types/products";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GalleryLayoutTwo } from "./variants/gallery-layout-two";
import { GalleryLayoutThree } from "./variants/gallery-layout-three";
import { GalleryLayoutOne } from "./variants/gallery-layout-one";
import { StorefrontConfigV1 } from "@/config/types/types";

interface GalleryProps extends ProductGalleryProps {
  selectedColor?: string | null;
  /** The currently-selected variant's own image, from ANY attribute
   * (color, size, material, etc) — generic swap trigger, distinct from
   * selectedColor which only seeds the default color-grouped image set. */
  activeVariantImage?: string | null;
  config?: NonNullable<
    NonNullable<NonNullable<StorefrontConfigV1["ui"]>["product"]>
  >;
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
  const pAttrs: any[] = product?.attributes ?? [];
  if (pAttrs.some((a) => isColorAttrName(a?.name))) return true;

  const vars: any[] = product?.variations ?? [];
  return vars.some((v) =>
    (v?.attributes ?? []).some((a: any) => isColorAttrName(a?.name))
  );
}

export function ProductGallery({
  product,
  selectedColor,
  activeVariantImage,
  config,
}: GalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const lastColorRef = useRef<string | null>(null);
  const lastVariantImageRef = useRef<string | null>(null);

  const hasColor = useMemo(() => productHasAnyColor(product), [product]);

  const galleryImages = useMemo(() => {
    const srcSet = new Set<string>();
    const out: string[] = [];

    const pushSrc = (src?: string | null) => {
      if (!src) return;
      if (!srcSet.has(src)) {
        srcSet.add(src);
        out.push(src);
      }
    };

    // ✅ 1) include ALL product images first (ordered from API; hero should already be first)
    const pImgs: any[] = product?.images ?? [];
    for (const img of pImgs) pushSrc(img?.src);

    // ✅ fallback hero safety (in case product.images is empty but someone still sets hero elsewhere)
    if (!out.length) pushSrc(product?.images?.[0]?.src ?? null);

    // ✅ 2) include variation images (color logic)
    const variations: any[] = product?.variations ?? [];

    if (hasColor) {
      // one representative image per color, for the default gallery view
      const colorToSrc = new Map<string, string>();

      for (const v of variations) {
        const color = norm(getVariationColor(v));
        const src = v?.image?.src ?? null;
        if (!color || !src) continue;
        if (!colorToSrc.has(color)) colorToSrc.set(color, src);
      }

      for (const src of colorToSrc.values()) pushSrc(src);
    }

    // Always include every variant's own distinct image, regardless of
    // which attribute defines it — so switching size (or any other
    // attribute) to a variant with its own photo has something in this
    // array for the sync effect below to actually find and select.
    for (const v of variations) pushSrc(v?.image?.src ?? null);

    return out.length ? out : ["/placeholder.png"];
  }, [product, hasColor]);

  const clampActiveImage = useEffectEvent((len: number) => {
    setActiveImage((i) => Math.max(0, Math.min(i, len - 1)));
  });

  useEffect(() => {
    clampActiveImage(galleryImages.length);
  }, [galleryImages.length]);

  // ✅ Only sync by selectedColor when product actually has color
  const syncSelectedColor = useEffectEvent((color?: string | null) => {
    if (!hasColor) return;
    if (!color) return;

    const normalized = norm(color);
    if (lastColorRef.current === normalized) return;
    lastColorRef.current = normalized;

    const match = (product?.variations ?? []).find((v: any) => {
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

  // Generic swap: whatever attribute changed (color, size, material...),
  // if the resulting variant has its own image, show it. Falls back to
  // leaving the gallery as-is when the new variant has no distinct photo.
  const syncActiveVariantImage = useEffectEvent((src?: string | null) => {
    if (!src) return;
    if (lastVariantImageRef.current === src) return;
    lastVariantImageRef.current = src;

    const idx = galleryImages.indexOf(src);
    if (idx !== -1) setActiveImage(idx);
  });

  useLayoutEffect(() => {
    syncActiveVariantImage(activeVariantImage);
  }, [activeVariantImage]);

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

  const variant = config?.galleryVariant ?? "V1";

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
}
