"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCategoryGridSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { StorefrontCategory } from "@/features/Collections/actions/get-collections";

const ASPECTS = [
  "aspect-[1/1]",
  "aspect-[5/4]",
  "aspect-[5/6]",
  "aspect-[12/9]",
  "aspect-[5/4]",
  "aspect-[1/1]",
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
    const isHub = !c.parentId && c.hasChildren; // top-level AND has children

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
          <div className="mb-10">
            {title && (
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                {title}
              </h2>
            )}
            {subtitle ? (
              <p className="mt-3 text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        )}

        <div className="columns-1 md:columns-3 gap-6 [column-fill:balance]">
          {items.map((item, idx) => {
            const aspectClass = ASPECTS[idx % ASPECTS.length];

            return (
              <div
                key={`${item.href}-${idx}`}
                className="mb-6 break-inside-avoid"
              >
                <Link href={item.href} className="block w-full">
                  <div className="group relative w-full overflow-hidden rounded-xl">
                    <div className={`relative w-full ${aspectClass}`}>
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 100vw, (min-width: 768px) 33vw"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/35" />

                    {item.label ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="rounded-full bg-background/90 px-5 py-2 text-sm font-medium text-foreground backdrop-blur">
                            {item.label}
                          </div>
                        </div>
                      </div>
                    ) : null}
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
