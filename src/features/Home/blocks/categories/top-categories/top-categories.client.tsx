// src/components/home/TopCategories/TopCategories.client.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import type { TopCategoriesSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import { StorefrontCategory } from "@/features/Collections/actions/get-collections";

type UiCategory = {
  href: string;
  src: string;
  name: string;
  imageAlt?: string | null;
};

const FALLBACK_IMAGE = "https://placehold.co/600x600?text=Category";

export default function TopCategoriesClient({
  config,
  categories,
}: {
  config: TopCategoriesSectionV1;
  categories: StorefrontCategory[];
}) {
  const mapped = useMemo<UiCategory[]>(() => {
    return categories.map((c) => ({
      href: `/collections/${c.slug}`,
      src: c.imageUrl || FALLBACK_IMAGE,
      name: c.name, // text shown in UI
      imageAlt: c.imageAltText, // ONLY for <img alt="">
    }));
  }, [categories]);

  const initial = useMemo(() => [...mapped], [mapped]);
  const [items, setItems] = useState(initial);

  // eslint-disable-next-line react-hooks/set-state-in-render
  useMemo(() => setItems([...mapped]), [mapped]);

  const handleNext = () => {
    setItems((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
  };

  const handlePrev = () => {
    setItems((prev) =>
      prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev
    );
  };

  return (
    <section className="w-full py-10 mx-auto">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-4 w-[95%] mx-auto">
        <div className="mt-10 mb-2.5">
          <h2 className="text-2xl font-semibold">
            {config.title ?? "Shop by Category"}
          </h2>
          {config.subtitle ? (
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-9 w-9 items-center justify-center bg-background/80 transition cursor-pointer"
            aria-label="Previous category"
          >
            <FaChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center bg-background/80 transition cursor-pointer"
            aria-label="Next category"
          >
            <FaChevronRight className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative overflow-x-hidden w-[95%] mx-auto">
        <div className="flex gap-6 pb-3 w-max pl-6 md:pl-8">
          {items.map((cat, idx) => (
            <Link
              key={`${cat.href}-${idx}`}
              href={cat.href}
              className={`
                group relative shrink-0
                w-56 md:w-56 lg:w-70 aspect-square
                overflow-hidden rounded-xl bg-muted
                shadow-sm hover:shadow-md transition
                ${idx === 0 ? "-ml-6 md:-ml-8" : ""}
              `}
            >
              <Image
                src={cat.src}
                alt={cat.imageAlt ?? ""} // empty string is correct for decorative images
                fill
                sizes="(max-width: 768px) 220px, 264px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={idx === 0}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />

              {cat.name && (
                <div className="absolute inset-x-3 bottom-3 z-10">
                  <p className="text-sm font-semibold underline text-white drop-shadow-sm capitalize">
                    {cat.name}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
