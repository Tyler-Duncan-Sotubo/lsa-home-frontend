"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCategoryGridSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import { SectionReveal } from "@/shared/animations/section-reveal";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";
import { RevealFromSide } from "@/shared/animations/reveal-from-side";

const ASPECTS = [
  "aspect-[1/1]",
  "aspect-[5/4]",
  "aspect-[5/6]",
  "aspect-[12/9]",
  "aspect-[5/4]",
  "aspect-[1/1]",
] as const;

export function ProductCategoryGridSection({
  config,
}: {
  config: ProductCategoryGridSectionV1;
}) {
  if (config.enabled === false) return null;

  const { title, subtitle, items } = config;

  return (
    <section className="w-[95%] mx-auto py-16">
      <div className="container mx-auto">
        {(title || subtitle) && (
          <SectionReveal className="mb-10">
            {title && (
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-muted-foreground">{subtitle}</p>
            )}
          </SectionReveal>
        )}

        <Stagger className="columns-1 md:columns-3 gap-6 [column-fill:balance]">
          {items.map((item, idx) => {
            const aspectClass = ASPECTS[idx % ASPECTS.length];

            // Optional: alternate reveal direction for a bit of visual variety
            const direction =
              idx % 3 === 0 ? "up" : idx % 3 === 1 ? "left" : "right";

            const CardInner = (
              <div className="group relative w-full overflow-hidden rounded-xl">
                <div className={`relative w-full ${aspectClass}`}>
                  <Image
                    src={item.src}
                    alt={item.alt ?? "Category"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 100vw, (min-width: 768px) 33vw"
                  />
                </div>

                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/35" />

                {item.alt && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-full bg-background/90 px-5 py-2 text-sm font-medium text-foreground backdrop-blur">
                        {item.alt}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );

            return (
              <StaggerItem key={idx} className="mb-6 break-inside-avoid" y={10}>
                <RevealFromSide direction={direction} distance={20}>
                  {item.href ? (
                    <Link href={item.href} className="block w-full">
                      {CardInner}
                    </Link>
                  ) : (
                    CardInner
                  )}
                </RevealFromSide>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
