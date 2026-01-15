"use client";

import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useRef, useState } from "react";

export function GalleryLayoutOne({
  images,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  alt,
}: {
  images: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  alt: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");

  const safeImages = images?.length ? images : ["/placeholder.png"];
  const hasMultiple = safeImages.length > 1;

  const src = safeImages[activeIndex] || safeImages[0] || "/placeholder.png";

  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const SPEED = 0.5; // 0.3 = slow, 0.6 = smooth, 1 = instant

    const x =
      ((e.clientX - rect.left) / rect.width) * 100 * SPEED + 50 * (1 - SPEED);

    const y =
      ((e.clientY - rect.top) / rect.height) * 100 * SPEED + 50 * (1 - SPEED);

    setBgPos(`${x}% ${y}%`);
  };

  return (
    <div className="relative border-b md:border-b-0 md:h-162.5">
      <div className="flex h-full">
        {/* Thumbs (only if multiple images) */}
        {hasMultiple && (
          <aside className="hidden md:flex flex-col gap-3 p-2 w-18 shrink-0 overflow-y-auto">
            {safeImages.slice(0, 9).map((thumbSrc, index) => (
              <button
                key={`${thumbSrc}-${index}`}
                onClick={() => onSelect(index)}
                className={`relative w-full aspect-square overflow-hidden ${
                  index === activeIndex
                    ? "ring-2 ring-foreground"
                    : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Select image ${index + 1}`}
                type="button"
              >
                <Image
                  src={
                    thumbSrc ??
                    "https://centa-hr.s3.amazonaws.com/019bbc22-ee74-7bfa-a6af-0a801a3d2e24/no-image.jpeg"
                  }
                  alt={alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </aside>
        )}

        {/* Main */}
        <div className="relative flex-1 flex items-center justify-center p-2">
          <div
            ref={containerRef}
            className="relative w-full h-100 md:h-162.5 overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={onMouseMove}
            onTouchStart={() => setShowZoom(false)} // disable zoom on touch
          >
            <Image
              src={
                src ??
                "https://centa-hr.s3.amazonaws.com/019bbc22-ee74-7bfa-a6af-0a801a3d2e24/no-image.jpeg"
              }
              alt={alt}
              fill
              className="object-cover"
            />

            {/* Zoom overlay */}
            {showZoom && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "170%",
                  backgroundPosition: bgPos,
                }}
              />
            )}
          </div>

          {/* Arrows (only if multiple images) */}
          {hasMultiple && (
            <>
              <button
                onClick={onPrev}
                aria-label="Previous image"
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow"
                type="button"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={onNext}
                aria-label="Next image"
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow"
                type="button"
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
