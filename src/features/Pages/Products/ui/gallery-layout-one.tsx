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

  const src = images[activeIndex] || "/placeholder.png";

  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setBgPos(`${x}% ${y}%`);
  };

  return (
    <div className="relative border-b md:border-b-0 md:h-162.5">
      <div className="flex h-full">
        {/* Thumbs */}
        <aside className="hidden md:flex flex-col gap-3 p-2 w-18 shrink-0 overflow-y-auto">
          {images.slice(0, 9).map((src, index) => (
            <button
              key={`${src}-${index}`}
              onClick={() => onSelect(index)}
              className={`relative w-full aspect-square overflow-hidden ${
                index === activeIndex
                  ? "ring-2 ring-foreground"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src || "/placeholder.png"}
                alt={alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </aside>

        {/* Main */}
        <div className="relative flex-1 flex items-center justify-center p-2">
          <div
            ref={containerRef}
            className="relative w-full h-100 md:h-162.5 overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={onMouseMove}
            onTouchStart={() => setShowZoom(false)} // ✅ disable on touch
          >
            <Image src={src} alt={alt} fill className="object-cover" />

            {/* Zoom overlay */}
            {showZoom && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "200%", // zoom strength
                  backgroundPosition: bgPos,
                }}
              />
            )}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={onPrev}
                aria-label="Previous image"
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={onNext}
                aria-label="Next image"
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow"
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
