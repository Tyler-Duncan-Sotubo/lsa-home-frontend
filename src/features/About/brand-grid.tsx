"use client";

import Image from "next/image";
import Link from "next/link";
import type { BrandGridSectionV1 } from "@/config/types/pages/About/about-sections.types";

export default function BrandGrid({ config }: { config: BrandGridSectionV1 }) {
  if (config.enabled === false) return null;

  const bgClass = config.layout?.backgroundClassName ?? "bg-background";
  const containerClass = config.layout?.containerClassName ?? "w-[95%] mx-auto";
  const gapClass = config.layout?.gapClassName ?? "gap-6 md:gap-10";
  const itemClass = config.layout?.itemClassName ?? "h-12 md:h-16 w-28 md:w-40";

  const brands = config.brands ?? [];
  if (!brands.length) return null;

  return (
    <section className={`w-full py-12 md:py-16 ${bgClass}`}>
      <div className={containerClass}>
        {(config.title || config.subtitle) && (
          <div className="mb-8 md:mb-10 text-center">
            {config.title ? (
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {config.title}
              </h2>
            ) : null}
            {config.subtitle ? (
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                {config.subtitle}
              </p>
            ) : null}
          </div>
        )}

        <div
          className={`flex flex-wrap items-center justify-center ${gapClass}`}
        >
          {brands.map((b, idx) => {
            const logo = (
              <div
                className={`relative ${itemClass} opacity-90 hover:opacity-100 transition`}
              >
                <Image
                  src={b.src}
                  alt={b.alt ?? "Brand logo"}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            );

            return b.href ? (
              <Link
                key={`${b.src}-${idx}`}
                href={b.href}
                className="shrink-0"
                aria-label={b.alt ?? "Brand"}
              >
                {logo}
              </Link>
            ) : (
              <div key={`${b.src}-${idx}`} className="shrink-0">
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
