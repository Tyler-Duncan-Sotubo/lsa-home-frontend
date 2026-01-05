"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import type { TopCategoriesSectionV1 } from "@/config/types/pages/Home/home-sections.types";

export default function TopCategories({
  config,
}: {
  config: TopCategoriesSectionV1;
}) {
  const initial = useMemo(() => [...config.categories], [config.categories]);
  const [items, setItems] = useState(initial);

  const handleNext = () => {
    setItems((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
  };

  const handlePrev = () => {
    setItems((prev) =>
      prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev
    );
  };

  return (
    <section className="w-full py-10">
      <div className="w-[95%] mx-auto">
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between gap-4">
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
        <div className="relative overflow-x-hidden">
          <div className="flex gap-6 pb-3 w-max">
            {items.map((cat, idx) => (
              <Link
                key={`${cat.href}-${idx}`}
                href={cat.href}
                className="
                  group
                  relative
                  shrink-0
                 w-56
md:w-72
lg:w-80
aspect-4/5
                  overflow-hidden
                  rounded-xl
                  bg-muted
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                <Image
                  src={cat.src}
                  alt={cat.alt ?? "Category"}
                  fill
                  sizes="(max-width: 768px) 220px, 264px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={idx === 0}
                />

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />

                {cat.alt ? (
                  <div className="absolute inset-x-3 bottom-3 z-10">
                    <p className="text-sm font-semibold underline text-white drop-shadow-sm">
                      {cat.alt}
                    </p>
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
