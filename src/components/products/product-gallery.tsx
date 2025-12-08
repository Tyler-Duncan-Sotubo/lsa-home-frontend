"use client";

import type { ProductGalleryProps } from "@/types/products";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

interface GalleryProps extends ProductGalleryProps {
  selectedColor?: string | null;
}

export function ProductGallery({ product, selectedColor }: GalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const lastColorRef = useRef<string | null>(null);

  const galleryImages = useMemo(() => {
    const productImages = (product.images ?? [])
      .map((img) => img?.src)
      .filter(Boolean) as string[];

    const variationImages =
      product.variations
        ?.map((variation) => variation.image?.src)
        .filter(Boolean) ?? [];

    const combined = Array.from(
      new Set([...productImages, ...variationImages])
    );

    if (combined.length === 0) return ["/placeholder.png"];
    if (combined.length === 1) {
      return Array.from({ length: 4 }, () => combined[0]);
    }

    return combined;
  }, [product.images, product.variations]);

  const safeActive = Math.min(activeImage, galleryImages.length - 1);

  useEffect(() => {
    if (!selectedColor || !product.variations) return;
    if (lastColorRef.current === selectedColor) return;
    lastColorRef.current = selectedColor;

    const lower = selectedColor.toLowerCase();

    const matchingVariation = product.variations.find((v) =>
      v.attributes?.some(
        (attr) =>
          attr.name.toLowerCase().includes("color") &&
          attr.option.toLowerCase() === lower
      )
    );

    const src = matchingVariation?.image?.src;
    if (!src) return;

    const idx = galleryImages.indexOf(src);
    if (idx !== -1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveImage(idx);
    }
  }, [selectedColor, product.variations, galleryImages]);

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
              key={`${src || "placeholder"}-${index}`}
              onClick={() => setActiveImage(index)}
              className={`
      relative w-full aspect-square overflow-hidden 
      ${
        index === safeActive
          ? "ring-2 ring-foreground"
          : "opacity-70 hover:opacity-100"
      }
    `}
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
