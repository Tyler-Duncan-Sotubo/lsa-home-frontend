"use client";

import Image from "next/image";

interface BundleGalleryItem {
  id: string;
  src: string | null;
  alt: string;
}

interface BundleGalleryProps {
  items: BundleGalleryItem[];
}

// A bundle's own product row often has no dedicated image, so instead of a
// single static hero, show every component's image in a scrollable 2-column
// grid — nothing to swap per selection since each component keeps its own
// tile regardless of which variant the customer picks.
export function BundleGallery({ items }: BundleGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="grid max-h-[36rem] grid-cols-2 gap-3 overflow-y-auto md:max-h-[calc(100vh-8rem)]">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
        >
          {item.src ? (
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 50vw, 27vw"
              className="object-cover"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
