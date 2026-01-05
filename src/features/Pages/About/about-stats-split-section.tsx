/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import type { AboutStatsSplitSectionV1 } from "@/config/types/pages/About/about-sections.types";
import { RevealFromSide } from "@/shared/animations/reveal-from-side";

/** ---------- helpers ---------- */

function useInViewOnce<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { threshold: 0.25, ...options }
    );

    obs.observe(ref.current);

    return () => obs.disconnect();
  }, [inView, options]);

  return { ref, inView } as const;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatStat(value: number, suffix?: string) {
  const rounded = Math.round(value);
  return `${rounded}${suffix ?? ""}`;
}

/** ---------- animated number ---------- */

function CountUp({
  start = 0,
  to,
  suffix,
  durationMs = 1200,
  startWhen,
  className,
}: {
  start?: number;
  to: number;
  suffix?: string;
  durationMs?: number;
  startWhen: boolean;
  className?: string;
}) {
  const [val, setVal] = useState(start);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startWhen) return;

    const t0 = performance.now();
    const from = start;
    const target = to;

    const tick = (t: number) => {
      const p = clamp((t - t0) / durationMs, 0, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (target - from) * eased;

      setVal(next);

      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startWhen, to, durationMs]);

  return <div className={className}>{formatStat(val, suffix)}</div>;
}

/** ---------- circle progress ---------- */

function CircleProgress({
  value, // 0-100
  durationMs = 1200,
  startWhen,
  suffix = "%",
  label,
}: {
  value: number;
  durationMs?: number;
  startWhen: boolean;
  suffix?: string;
  label?: string;
}) {
  const size = 86;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const [v, setV] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startWhen) return;

    const t0 = performance.now();
    const target = clamp(value, 0, 100);

    const tick = (t: number) => {
      const p = clamp((t - t0) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = target * eased;

      setV(next);

      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startWhen, value, durationMs]);

  const dash = c * (v / 100);
  const dashoffset = c - dash;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} aria-label={label ?? "Progress"}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-lg font-bold text-foreground">
          {formatStat(v, suffix)}
        </div>
      </div>
    </div>
  );
}

/** ---------- component ---------- */

export default function AboutStatsSplitSection({
  config,
}: {
  config: AboutStatsSplitSectionV1;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.2 });

  // normalize stats (still render nicely even if animate is missing)
  const stats = useMemo(() => config.stats ?? [], [config.stats]);

  if (config.enabled === false) return null;

  const bgClass = config.layout?.backgroundClassName ?? "bg-muted";
  const heightClass = config.layout?.heightClass ?? "";
  const imagePosition = config.layout?.imagePosition ?? "right";

  const imageOrder = imagePosition === "right" ? "md:order-2" : "md:order-1";
  const contentOrder = imagePosition === "right" ? "md:order-1" : "md:order-2";

  const imageRevealDir = imagePosition === "right" ? "right" : "left";

  const overlayClass = config.overlay?.className ?? "bg-black/10";

  return (
    <section className={`w-full ${bgClass} ${heightClass} py-14 md:py-18`}>
      <div ref={ref} className="mx-auto w-[95%] max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch gap-10">
          {/* Text / Stats */}
          <RevealFromSide direction="up" className={`flex ${contentOrder}`}>
            <div className="w-full flex flex-col justify-center">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                {config.content.title}
              </h2>

              {config.content.description ? (
                <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {config.content.description}
                </p>
              ) : null}

              {config.content.highlights?.length ? (
                <ul className="mt-5 space-y-2">
                  {config.content.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="text-sm md:text-base text-foreground"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-3 sm:grid-cols-3 gap-6">
                {stats.map((s, idx) => {
                  const anim = (s as any).animate as
                    | {
                        type: "countUp";
                        to: number;
                        suffix?: string;
                        durationMs?: number;
                      }
                    | {
                        type: "circle";
                        to: number;
                        suffix?: string;
                        durationMs?: number;
                      }
                    | undefined;

                  const hasCircle = anim?.type === "circle";
                  const durationMs = anim?.durationMs ?? 1200;

                  return (
                    <div
                      key={`${s.label}-${idx}`}
                      className="flex flex-col items-start"
                    >
                      <div className="text-sm text-muted-foreground">
                        {s.label}
                      </div>

                      <div className="mt-2">
                        {hasCircle ? (
                          <CircleProgress
                            value={anim.to}
                            suffix={anim.suffix ?? "%"}
                            durationMs={durationMs}
                            startWhen={inView}
                            label={s.label}
                          />
                        ) : anim?.type === "countUp" ? (
                          <CountUp
                            to={anim.to}
                            suffix={anim.suffix}
                            durationMs={durationMs}
                            startWhen={inView}
                            className="text-3xl md:text-4xl font-bold text-foreground"
                          />
                        ) : (
                          <div className="text-3xl md:text-4xl font-bold text-foreground">
                            {s.value}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {config.cta ? (
                <div className="mt-10">
                  <Link href={config.cta.href}>
                    <Button size="lg">{config.cta.label}</Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </RevealFromSide>

          {/* Image */}
          <RevealFromSide
            direction={imageRevealDir as any}
            className={`${imageOrder}`}
          >
            <div className="relative w-full h-full min-h-90 md:min-h-130 overflow-hidden rounded-2xl">
              <Image
                src={config.image.src}
                alt={config.image.alt ?? "Section image"}
                fill
                className="object-cover"
                sizes="100vw, (min-width: 768px) 50vw"
              />
              <div className={`absolute inset-0 ${overlayClass}`} />
            </div>
          </RevealFromSide>
        </div>
      </div>
    </section>
  );
}
