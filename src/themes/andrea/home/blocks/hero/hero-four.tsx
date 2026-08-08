"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroFourConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { Button } from "@/shared/ui/button";

// ─── Content alignment map ────────────────────────────────────────────────────

const CONTENT_ALIGN_MAP = {
  top: "justify-start pt-16",
  center: "justify-center",
  bottom: "justify-end pb-16",
};

const CONTENT_POSITION_MAP = {
  left: "items-start text-left",
  right: "items-end text-right",
};

// Overlay tints toward whichever side the text sits on, so the photo
// itself stays fully visible everywhere else — matches the reference
// design's highlighted text blocks rather than a flat scrim.
const OVERLAY_POSITION_MAP = {
  left: "bg-gradient-to-r from-black/55 via-black/20 to-transparent",
  right: "bg-gradient-to-l from-black/55 via-black/20 to-transparent",
};

// ─── Rotating Badge ───────────────────────────────────────────────────────────

function RotatingBadge({ text, subtext }: { text: string; subtext?: string }) {
  const repeated = `${text} ${text} `;

  return (
    <div className="absolute bottom-8 left-8 z-20 w-24 h-24 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ animation: "spin-slow 12s linear infinite" }}
      >
        <defs>
          <path
            id="badge-circle"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text className="text-[11px] fill-white tracking-[0.2em] uppercase font-medium">
          <textPath href="#badge-circle" startOffset="0%">
            {repeated}
          </textPath>
        </text>
      </svg>

      {subtext && (
        <span className="relative z-10 text-[10px] font-semibold tracking-widest uppercase text-white text-center leading-tight">
          {subtext}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HeroFour({ config }: { config: HeroFourConfigV1 }) {
  const heightClass = config.layout?.heightClass ?? "min-h-[85svh]";
  const contentPosition = config.layout?.contentPosition ?? "right";
  const contentAlign =
    CONTENT_ALIGN_MAP[config.layout?.contentAlign ?? "center"];
  const overlayClassName =
    config.layout?.overlayClassName ?? OVERLAY_POSITION_MAP[contentPosition];

  return (
    <>
      <section
        className={`relative w-full overflow-hidden ${heightClass}`}
      >
        {/* Background photo — full bleed */}
        <Image
          src={config.image.src}
          alt={config.image.alt ?? "Hero image"}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Tint for text legibility */}
        <div className={`absolute inset-0 ${overlayClassName}`} />

        {/* Accent image — overlapping portrait inset */}
        {config.image.accent && (
          <div className="absolute bottom-8 right-8 w-32 md:w-40 aspect-[3/4] shadow-2xl border-4 border-background overflow-hidden z-10">
            <Image
              src={config.image.accent.src}
              alt={config.image.accent.alt ?? "Detail image"}
              fill
              className="object-cover object-center"
              sizes="160px"
            />
          </div>
        )}

        {/* Rotating badge */}
        {config.badge && (
          <RotatingBadge text={config.badge.text} subtext={config.badge.subtext} />
        )}

        {/* Content — overlaid directly on the photo */}
        <div
          className={`
            relative z-10 flex flex-col ${contentAlign} ${CONTENT_POSITION_MAP[contentPosition]}
            h-full w-full px-8 md:px-12 lg:px-16 py-16
          `}
        >
          <div className="max-w-lg">
            {/* Eyebrow */}
            {config.content.eyebrow && (
              <p className="text-[0.72rem] tracking-[0.2em] uppercase text-white/80 mb-4">
                {config.content.eyebrow}
              </p>
            )}

            {/* Heading */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-white">
              {config.content.heading}
            </h1>

            {/* Divider */}
            <div
              className={`w-12 h-px bg-primary mt-6 mb-6 ${
                contentPosition === "right" ? "ml-auto" : ""
              }`}
            />

            {/* Description */}
            {config.content.description && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                {config.content.description}
              </p>
            )}

            {/* CTA */}
            {config.content.cta && (
              <div
                className={`flex flex-wrap items-center gap-3 mt-8 ${
                  contentPosition === "right" ? "justify-end" : ""
                }`}
              >
                <Link href={config.content.cta.href}>
                  <Button size="lg" variant="pill" className="h-14 px-8">
                    {config.content.cta.label}
                  </Button>
                </Link>
              </div>
            )}

            {/* Tagline */}
            {config.content.tagline && (
              <p className="mt-6 text-[0.7rem] tracking-[0.15em] uppercase text-white/70">
                {config.content.tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bottom strip */}
      {config.bottomStrip?.enabled !== false && config.bottomStrip?.text && (
        <div
          className={`
            w-full text-center py-2.5 px-4
            text-[0.7rem] tracking-[0.15em] uppercase
            ${config.bottomStrip.className ?? "bg-primary text-primary-foreground"}
          `}
        >
          {config.bottomStrip.text}
        </div>
      )}
    </>
  );
}
