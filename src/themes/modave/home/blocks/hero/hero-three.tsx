/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { HeroThreeConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroThree({ config }: { config: HeroThreeConfigV1 }) {
  const heightClass = config.layout?.heightClass ?? "h-[70vh] md:h-[85vh]";
  const overlayClass = config.overlay?.className ?? "bg-black/40";
  const align = config.layout?.align ?? "left";

  const contentAlignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const containerAlignClass =
    align === "center" ? "justify-center" : "justify-start";

  const showArrows = config.layout?.showArrows ?? true;
  const showDots = config.layout?.showDots ?? true;

  const autoplayEnabled = config.autoplay?.enabled ?? true;
  const autoplayMs = config.autoplay?.intervalMs ?? 6000;

  const slides = config.slides ?? [];

  const navId = useId();
  const paginationId = `hero-pagination-${navId}`;
  const count = slides.length;
  const prevClass = `hero-prev-${navId}`;
  const nextClass = `hero-next-${navId}`;

  if (!slides.length) return null;

  return (
    <section className="w-full">
      <div className={`relative w-full ${heightClass} overflow-hidden`}>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          loop
          autoplay={
            autoplayEnabled
              ? { delay: autoplayMs, disableOnInteraction: false }
              : false
          }
          navigation={{
            prevEl: `.${prevClass}`,
            nextEl: `.${nextClass}`,
          }}
          pagination={showDots ? { clickable: true } : false}
          className="absolute inset-0 h-full hero-swiper"
          style={
            {
              // Swiper CSS variables
              ["--swiper-theme-color" as any]: "var(--primary)",
              ["--swiper-pagination-color" as any]: "var(--primary)",
              ["--swiper-navigation-color" as any]: "var(--primary)",
              ["--swiper-pagination-bullet-inactive-color" as any]:
                "rgba(255,255,255,0.55)",
              ["--swiper-pagination-bullet-inactive-opacity" as any]: 1,
              ["--swiper-pagination-bullet-size" as any]: "15px",
              ["--swiper-navigation-size" as any]: "32px",
            } as React.CSSProperties
          }
        >
          {slides.map((slide, i) => {
            const content = {
              eyebrow: slide.content?.eyebrow ?? config.content.eyebrow,
              heading: slide.content?.heading ?? config.content.heading,
              description:
                slide.content?.description ?? config.content.description,
              cta: slide.content?.cta ?? config.content.cta,
            };

            return (
              <SwiperSlide key={i}>
                {/* Background image */}
                <div className="absolute inset-0">
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt ?? `Hero image ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover object-[center_35%]"
                  />
                  <div className={`absolute inset-0 ${overlayClass}`} />
                </div>

                {/* Content */}
                <div
                  className={`relative z-10 h-full px-6 md:px-10 flex ${containerAlignClass}`}
                >
                  <Stagger
                    className={`w-full max-w-3xl flex flex-col justify-center ${contentAlignClass}`}
                    delayChildren={0.05}
                    staggerChildren={0.08}
                  >
                    {content.eyebrow && (
                      <StaggerItem>
                        <h3 className="text-sm md:text-base font-semibold tracking-wide text-white/90 uppercase mb-6 drop-shadow-lg">
                          {content.eyebrow}
                        </h3>
                      </StaggerItem>
                    )}

                    <StaggerItem y={14}>
                      <h1 className="text-3xl md:text-6xl font-bold text-white drop-shadow-xl capitalize">
                        {content.heading}
                      </h1>
                    </StaggerItem>

                    {content.description && (
                      <StaggerItem y={12}>
                        <p className="mt-6 text-base md:text-xl text-white/90 drop-shadow font-medium">
                          {content.description}
                        </p>
                      </StaggerItem>
                    )}

                    {content.cta && (
                      <StaggerItem y={10}>
                        <div className="mt-6">
                          <Link href={content.cta.href}>
                            <Button>{content.cta.label}</Button>
                          </Link>
                        </div>
                      </StaggerItem>
                    )}
                  </Stagger>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {config.bottomStrip?.enabled !== false && (
        <div
          className={`${
            config.bottomStrip?.className ??
            "bg-primary text-primary-foreground"
          } w-full text-center font-semibold`}
        >
          <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 text-sm md:text-lg">
            {config.bottomStrip?.text}
          </div>
        </div>
      )}

      {showDots && count > 1 ? (
        <div
          className={[
            paginationId,
            "hero-pagination",
            "absolute bottom-6 left-1/2 -translate-x-1/2 z-20",
            "flex items-center justify-center gap-2",
          ].join(" ")}
        />
      ) : null}

      {showArrows && count > 1 && (
        <>
          <button
            className={[
              prevClass,
              "absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex",
              "h-11 w-11 rounded-full",
              "bg-white text-black",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:bg-black hover:text-white",
              "shadow-md",
            ].join(" ")}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            className={[
              nextClass,
              "absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex",
              "h-11 w-11 rounded-full",
              "bg-white text-black",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:bg-black hover:text-white",
              "shadow-md",
            ].join(" ")}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
