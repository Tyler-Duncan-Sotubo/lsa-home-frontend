"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { HappyCustomersSectionV1 } from "@/config/types/pages/Home/home-sections.types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function HappyCustomersSection({
  config,
}: {
  config: HappyCustomersSectionV1;
}) {
  const intervalMs = config.autoplay?.intervalMs ?? 6000;
  const autoplay = config.autoplay?.enabled ?? true;

  const slides = config.slides;
  const [active, setActive] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  const activeSlide = slides[active];

  // progress: 0..1 for active thumbnail ring
  const progress = useMemo(() => {
    const elapsed = currentTime - startedAt;
    return clamp(elapsed / intervalMs, 0, 1);
  }, [currentTime, startedAt, intervalMs]);

  // Smooth progress updates
  const [, force] = useState(0);
  useEffect(() => {
    if (!autoplay) return;
    const raf = () => {
      setCurrentTime(Date.now());
      force((x) => x + 1);
      id = requestAnimationFrame(raf);
    };
    let id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [autoplay]);

  // Autoplay change
  useEffect(() => {
    if (!autoplay) return;

    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
      setStartedAt(Date.now());
    }, intervalMs);

    return () => clearInterval(t);
  }, [autoplay, intervalMs, slides.length]);

  const onSelect = useCallback((idx: number) => {
    setActive(idx);
    setStartedAt(Date.now());
  }, []);

  // conic ring (fills around)
  const ringStyle = (pct01: number) =>
    ({
      background: `conic-gradient(
      from -90deg,
      var(--primary) ${pct01 * 360}deg,
      transparent 0deg
    )`,
    } as React.CSSProperties);

  if (config.enabled === false) return null;

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24">
      {/* Decorations */}
      {config.decorations?.enabled ?? true ? (
        <>
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute top-10 right-10 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </>
      ) : null}

      <div className="relative mx-auto w-[95%] max-w-7xl">
        {/* Title */}
        <div className="mb-10 md:mb-14 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            {config.title}
          </h2>
          {config.subtitle ? (
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              {config.subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT */}
          <div className="lg:col-span-7">
            {/* Rating badges row */}
            {config.platformRatings?.length ? (
              <div className="mb-8 flex flex-wrap gap-3">
                {config.platformRatings.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-2xl border bg-background/70 px-4 py-3 shadow-sm"
                  >
                    {r.iconSrc ? (
                      <div className="relative h-5 w-5">
                        <Image
                          src={r.iconSrc}
                          alt={r.label}
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                    ) : (
                      <Star className="h-5 w-5 text-primary" />
                    )}
                    <div className="text-sm font-semibold text-foreground">
                      {r.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Main testimonial */}
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 blur-3xl" />

              <p className="text-lg md:text-2xl leading-relaxed font-medium text-foreground">
                {activeSlide.quote}
              </p>

              <div className="mt-8">
                <div className="text-base md:text-lg font-bold text-foreground">
                  {activeSlide.name}
                </div>
                {activeSlide.role ? (
                  <div className="text-sm text-muted-foreground">
                    {activeSlide.role}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* RIGHT: 2x2 avatars with active progress ring */}
          <div className="lg:col-span-5 relative">
            {config.decorations?.enabled ?? true ? (
              <div className="pointer-events-none absolute inset-0">
                {/* top-left */}
                <span className="emoji-float absolute -top-4 left-6 text-4xl">
                  ❤️
                </span>
                {/* top-right */}
                <span className="emoji-float2 absolute top-6 -right-3 text-4xl">
                  😊
                </span>
                {/* mid-left */}
                <span className="emoji-float3 absolute top-1/2 -left-4 -translate-y-1/2 text-4xl">
                  ✨
                </span>
                {/* bottom-left */}
                <span className="emoji-float2 absolute -bottom-5 left-10 text-4xl">
                  😍
                </span>
                {/* bottom-right */}
                <span className="emoji-float absolute bottom-6 -right-4 text-4xl">
                  👍
                </span>
                {/* extra */}
                <span className="emoji-float3 absolute -top-2 right-24 text-4xl">
                  💛
                </span>
              </div>
            ) : null}

            {/* Container (bg removed) */}
            <div className="relative p-6 md:p-4">
              <div className="relative h-90 w-full max-w-90 mx-auto">
                {slides.map((s, idx) => {
                  const isActive = idx === active;
                  const pct = isActive ? progress : 0;

                  // Diamond positions: top, right, bottom, left
                  const positions = [
                    "top-0 left-1/2 -translate-x-1/2",
                    "top-1/2 right-0 -translate-y-1/2",
                    "bottom-0 left-1/2 -translate-x-1/2",
                    "top-1/2 left-0 -translate-y-1/2",
                  ];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelect(idx)}
                      className={`absolute ${positions[idx]} group grid place-items-center`}
                      aria-label={`Show testimonial by ${s.name}`}
                    >
                      {isActive ? (
                        /* ACTIVE — show progress ring */
                        <div
                          className="grid place-items-center rounded-full p-1"
                          style={ringStyle(pct)}
                        >
                          <div className="rounded-full bg-background p-2">
                            <div className="relative h-20 w-20 overflow-hidden rounded-full">
                              <Image
                                src={s.avatar.src}
                                alt={s.avatar.alt ?? s.name}
                                fill
                                className="object-cover"
                                sizes="120px"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* INACTIVE — image only, no border */
                        <div className="relative h-20 w-20 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
                          <Image
                            src={s.avatar.src}
                            alt={s.avatar.alt ?? s.name}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        </div>
                      )}

                      {/* Optional active glow */}
                      {isActive ? (
                        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/30" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ensure --primary exists (you already set it via theme vars) */}
      <style jsx global>{`
        :root {
          --primary: hsl(var(--primary));
        }
      `}</style>
    </section>
  );
}
