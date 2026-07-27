"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroFourConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { Button } from "@/shared/ui/button";

// ─── Split ratio map ──────────────────────────────────────────────────────────

const SPLIT_MAP: Record<
  NonNullable<HeroFourConfigV1["layout"]>["split"] & string,
  { content: string; image: string }
> = {
  "50/50": { content: "md:w-1/2", image: "md:w-1/2" },
  "55/45": { content: "md:w-[45%]", image: "md:w-[55%]" },
  "60/40": { content: "md:w-[40%]", image: "md:w-[60%]" },
  "65/35": { content: "md:w-[35%]", image: "md:w-[65%]" },
};

const CONTENT_ALIGN_MAP = {
  top: "justify-start pt-16",
  center: "justify-center",
  bottom: "justify-end pb-16",
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
        <text className="text-[11px] fill-foreground tracking-[0.2em] uppercase font-medium">
          <textPath href="#badge-circle" startOffset="0%">
            {repeated}
          </textPath>
        </text>
      </svg>

      {subtext && (
        <span className="relative z-10 text-[10px] font-semibold tracking-widest uppercase text-foreground text-center leading-tight">
          {subtext}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HeroFour({ config }: { config: HeroFourConfigV1 }) {
  const split = config.layout?.split ?? "55/45";
  const { content: contentWidth, image: imageWidth } = SPLIT_MAP[split];
  const heightClass = config.layout?.heightClass ?? "min-h-[85svh]";
  const contentAlign =
    CONTENT_ALIGN_MAP[config.layout?.contentAlign ?? "center"];
  const contentPanelClass =
    config.layout?.contentPanelClassName ?? "bg-background";
  const imagePosition = config.image.position ?? "right";

  const contentPanel = (
    <div
      className={`
        relative flex flex-col ${contentAlign} w-full ${contentWidth}
        px-8 md:px-12 lg:px-16 py-16 ${contentPanelClass}
      `}
    >
      {/* Eyebrow */}
      {config.content.eyebrow && (
        <p className="text-[0.72rem] tracking-[0.2em] uppercase text-muted-foreground mb-4">
          {config.content.eyebrow}
        </p>
      )}

      {/* Heading */}
      <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-foreground">
        {config.content.heading}
      </h1>

      {/* Divider */}
      <div className="w-12 h-px bg-primary mt-6 mb-6" />

      {/* Description */}
      {config.content.description && (
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-sm">
          {config.content.description}
        </p>
      )}

      {/* CTAs */}
      {(config.content.cta || config.content.secondaryCta) && (
        <div className="flex flex-wrap items-center gap-3 mt-8">
          {config.content.cta && (
            <Link href={config.content.cta.href}>
              <Button size="lg">{config.content.cta.label}</Button>
            </Link>
          )}
          {config.content.secondaryCta && (
            <Link href={config.content.secondaryCta.href}>
              <Button size="lg" variant="clean">
                {config.content.secondaryCta.label}
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Tagline */}
      {config.content.tagline && (
        <p className="mt-6 text-[0.7rem] tracking-[0.15em] uppercase text-muted-foreground/70">
          {config.content.tagline}
        </p>
      )}
    </div>
  );

  const imagePanel = (
    <div
      className={`relative w-full ${imageWidth} ${heightClass} overflow-hidden`}
    >
      {/* Main image — full panel, no overlay */}
      <Image
        src={config.image.src}
        alt={config.image.alt ?? "Hero image"}
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 60vw"
      />

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
        <RotatingBadge
          text={config.badge.text}
          subtext={config.badge.subtext}
        />
      )}
    </div>
  );

  return (
    <>
      <section
        className={`
          relative w-full flex flex-col md:flex-row overflow-hidden ${heightClass}
        `}
      >
        {imagePosition === "left" ? (
          <>
            {imagePanel}
            {contentPanel}
          </>
        ) : (
          <>
            {contentPanel}
            {imagePanel}
          </>
        )}
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
