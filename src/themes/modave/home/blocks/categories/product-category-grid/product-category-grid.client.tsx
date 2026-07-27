"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCategoryGridSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { StorefrontCategory } from "@/features/Collections/actions/get-collections";

const ASPECTS = [
  "md:aspect-[1/1]",
  "md:aspect-[5/4]",
  "md:aspect-[5/6]",
  "md:aspect-[12/9]",
  "md:aspect-[5/4]",
  "md:aspect-[1/1]",
] as const;

const FALLBACK_IMAGE = "https://placehold.co/900x900?text=Category";

export default function ProductCategoryGridClient({
  config,
  categories,
}: {
  config: ProductCategoryGridSectionV1;
  categories: StorefrontCategory[];
}) {
  if (config.enabled === false) return null;

  const title = config.title ?? "Shop by category";
  const subtitle = config.subtitle ?? "";

  const items = categories.map((c) => {
    const isHub = !c.parentId && c.hasChildren;

    return {
      href: isHub ? `/collections/hubs/${c.slug}` : `/collections/${c.slug}`,
      src: c.imageUrl || FALLBACK_IMAGE,
      alt: c.imageAltText ?? c.name ?? "Category",
      label: c.name,
    };
  });

  return (
    <section className="w-[95%] mx-auto py-16">
      <div className="container mx-auto">
        {(title || subtitle) && (
          <div className="mb-10 flex gap-4 md:flex-row md:items-end justify-between">
            <div>
              {title && (
                <h2 className="text-xl md:text-3xl font-heading font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {subtitle ? (
                <p className="mt-3 text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            <Link
              href="/collections"
              className="inline-flex items-center gap-1 text-sm md:text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              See all
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}

        {/* 2 columns mobile, 3 columns md+ */}
        <div className="columns-2 md:columns-3 gap-6 [column-fill:balance]">
          {items.map((item, idx) => {
            const aspectClass = ASPECTS[idx % ASPECTS.length];

            return (
              <div
                key={`${item.href}-${idx}`}
                className="mb-6 break-inside-avoid"
              >
                <Link href={item.href} className="block w-full">
                  <div className="group relative w-full overflow-hidden rounded-xl">
                    {/* Image */}
                    <div
                      className={`relative w-full aspect-square ${aspectClass}`}
                    >
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 50vw, (min-width: 768px) 33vw"
                      />
                    </div>

                    {/* Subtle dark overlay for contrast */}
                    <div className="pointer-events-none absolute inset-0 bg-black/20" />

                    {/* ✅ Always-visible label */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
                      <div className="inline-block rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
