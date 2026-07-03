"use client";

import Image from "next/image";
import Link from "next/link";
import type { BrandCarouselSectionV1 } from "@/config/types/pages/Home/home-sections.types";

export default function BrandCarousel({
  config,
}: {
  config: BrandCarouselSectionV1;
}) {
  const autoplay = config.carousel?.autoplay ?? true;
  const pauseOnHover = config.carousel?.pauseOnHover ?? true;

  // Use intervalMs as "speed" input. Lower = faster.
  // Convert ms to seconds; clamp to a sensible range.
  const intervalMs = config.carousel?.intervalMs ?? 12000;
  const durationSec = Math.min(40, Math.max(8, Math.round(intervalMs / 1000)));

  const brands = config.brands ?? [];
  if (!brands.length) return null;

  // Duplicate for seamless loop
  const track = [...brands, ...brands];

  return (
    <section className="w-full py-10 md:py-14">
      <div className="mx-auto w-[95%] max-w-7xl">
        {(config.title || config.subtitle) && (
          <div className="mb-6 md:mb-8 text-center">
            {config.title ? (
              <h2 className="text-2xl md:text-3xl font-semibold">
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
          className={[
            "relative overflow-hidden rounded-2xl",
            pauseOnHover ? "group" : "",
          ].join(" ")}
        >
          {/* soft edge fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-card to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-card to-transparent z-10" />

          <div className="py-6 md:py-8">
            <div
              className={[
                "flex w-max items-center gap-10 md:gap-14 px-6",
                autoplay ? "animate-brand-marquee" : "",
                pauseOnHover ? "group-hover:paused" : "",
              ].join(" ")}
              style={{
                animationDuration: `${durationSec}s`,
              }}
            >
              {track.map((b, idx) => {
                const logo = (
                  <div className="relative h-10 md:h-22 w-35 md:w-45.5 opacity-90 hover:opacity-100 transition">
                    <Image
                      src={b.src}
                      alt={b.alt ?? "Brand logo"}
                      fill
                      className="object-contain"
                      sizes="180px"
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
        </div>

        {/* Local keyframes (no tailwind config needed) */}
        <style jsx>{`
          @keyframes brand-marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-brand-marquee {
            animation-name: brand-marquee;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
