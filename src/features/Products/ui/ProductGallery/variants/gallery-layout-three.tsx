"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function GalleryLayoutThree({
  images,
  activeIndex,
  alt,
}: {
  images: string[];
  activeIndex: number;
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
      <div
        ref={containerRef}
        className="relative w-full h-100 md:h-162.5 overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={onMouseMove}
        onTouchStart={() => setShowZoom(false)} // ✅ disable on touch
      >
        <Image src={src} alt={alt} fill className="object-cover" priority />

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
    </div>
  );
}
