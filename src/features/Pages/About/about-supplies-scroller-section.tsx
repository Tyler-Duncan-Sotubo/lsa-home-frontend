"use client";

import Image from "next/image";
import Link from "next/link";
import type { AboutSuppliesScrollerSectionV1 } from "@/config/types/pages/About/about-sections.types";

export default function AboutSuppliesScrollerSection({
  config,
}: {
  config: AboutSuppliesScrollerSectionV1;
}) {
  if (config.enabled === false) return null;

  const { content, items, layout, carousel } = config;

  const bgClass = layout?.backgroundClassName ?? "bg-background";
  const containerClass =
    layout?.containerClassName ?? "w-[95%] mx-auto max-w-7xl";
  const cardWidth = layout?.cardWidthClassName ?? "w-[260px] md:w-[360px]";
  const gapClass = layout?.gapClassName ?? "gap-4";

  const variant = carousel?.variant ?? "marquee";
  const autoplay = carousel?.autoplay ?? true;
  const pauseOnHover = carousel?.pauseOnHover ?? true;

  const intervalMs = carousel?.intervalMs ?? 14000;
  const durationSec = Math.min(40, Math.max(8, Math.round(intervalMs / 1000)));

  if (!items?.length) return null;

  // duplicate for marquee loop
  const track = variant === "marquee" ? [...items, ...items] : items;
  const topParagraph = content.paragraphs?.[0];
  const bottomParagraph = content.paragraphs?.[1];

  return (
    <section className={`w-full py-14 md:py-18 ${bgClass}`}>
      <div className={containerClass}>
        {/* Header */}
        {(content.title || content.subtitle || topParagraph) && (
          <div className="mb-10 md:mb-14 text-center max-w-3xl mx-auto">
            {content.title ? (
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {content.title}
              </h2>
            ) : null}

            {content.subtitle ? (
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                {content.subtitle}
              </p>
            ) : null}

            {topParagraph ? (
              <p className="mt-4 text-sm md:text-base text-muted-foreground font-semibold">
                {topParagraph}
              </p>
            ) : null}
          </div>
        )}

        {/* Scroller */}
        <div
          className={[
            "relative overflow-hidden",
            pauseOnHover && variant === "marquee" ? "group" : "",
          ].join(" ")}
        >
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background to-transparent z-10" />

          <div className="py-4 overflow-hidden ">
            <div
              className={[
                "flex items-center overflow-hidden ",
                gapClass,
                variant === "snap"
                  ? "overflow-x-auto snap-x snap-mandatory scrollbar-none px-2"
                  : "w-max px-6",
                autoplay && variant === "marquee"
                  ? "animate-supplies-marquee"
                  : "",
                pauseOnHover && variant === "marquee"
                  ? "group-hover:paused"
                  : "",
              ].join(" ")}
              style={
                variant === "marquee"
                  ? { animationDuration: `${durationSec}s` }
                  : undefined
              }
            >
              {track.map((item, idx) => {
                const image = (
                  <div
                    className={`relative ${cardWidth} aspect-square shrink-0 snap-start rounded-xl overflow-hidden hover:scale-105 cursor-pointer`}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt ?? "Supply item"}
                      fill
                      className="object-cover"
                      sizes="360px"
                    />
                  </div>
                );

                return item.href ? (
                  <Link
                    key={`${item.src}-${idx}`}
                    href={item.href}
                    className="shrink-0"
                  >
                    {image}
                  </Link>
                ) : (
                  <div key={`${item.src}-${idx}`} className="shrink-0">
                    {image}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {bottomParagraph ? (
          <div className="mt-10 max-w-3xl mx-auto text-center font-semibold">
            <p className="text-sm md:text-base text-muted-foreground">
              {bottomParagraph}
            </p>
          </div>
        ) : null}

        {/* Bottom CTA */}
        {content.cta ? (
          <div className="mt-10 text-center">
            <Link href={content.cta.href} className="underline font-medium">
              {content.cta.label}
            </Link>
          </div>
        ) : null}
      </div>

      {/* Local keyframes */}
      <style jsx>{`
        @keyframes supplies-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-supplies-marquee {
          animation-name: supplies-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .group-hover\\:paused:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
