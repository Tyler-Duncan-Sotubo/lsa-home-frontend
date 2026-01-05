"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { HeroCardSectionV1 } from "@/config/types/pages/common/hero-section.type";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";

function posClasses(
  pos: NonNullable<HeroCardSectionV1["layout"]>["cardPosition"]
) {
  switch (pos) {
    case "bottomLeft":
    case "centerLeft":
      return "justify-start";
    case "bottomRight":
    case "centerRight":
      return "justify-end";
    case "center":
    default:
      return "justify-center";
  }
}

function textAlignClasses(
  align: NonNullable<HeroCardSectionV1["layout"]>["textAlign"]
) {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    case "left":
    default:
      return "text-left";
  }
}

export default function HeroCardSection({
  config,
}: {
  config: HeroCardSectionV1;
}) {
  if (config.enabled === false) return null;

  const { background, card, layout } = config;

  const heightClass = layout?.heightClass ?? "min-h-[55svh]";
  const containerClass = layout?.containerClassName ?? "container mx-auto";
  const maxWidth = layout?.maxWidthClassName ?? "max-w-2xl";
  const cardPad = layout?.cardPaddingClassName ?? "p-6 md:p-10";
  const gap = layout?.contentGapClassName ?? "space-y-3";
  const pos = layout?.cardPosition ?? "centerLeft";
  const ta = layout?.textAlign ?? "left";

  return (
    <section
      className={["relative w-full flex items-center", heightClass].join(" ")}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={background.image.src}
          alt={background.image.alt ?? ""}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className={[
            "absolute inset-0",
            background.overlayClassName ?? "bg-black/35",
          ].join(" ")}
        />
      </div>

      {/* Content */}
      <div className={["relative w-[90%] md:w-full", containerClass].join(" ")}>
        <div className={["w-full flex", posClasses(pos)].join(" ")}>
          <div
            className={[
              "rounded-xl shadow-sm p-4 md:p-6 lg:p-8 backdrop-blur-sm",
              card.className ?? "bg-white/95 text-foreground",
              maxWidth,
              cardPad,
              textAlignClasses(ta),
            ].join(" ")}
          >
            {/* ✅ Animate the inner content */}
            <Stagger
              className={gap}
              delayChildren={0.05}
              staggerChildren={0.08}
            >
              {card.eyebrow ? (
                <StaggerItem>
                  <div className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    {card.eyebrow}
                  </div>
                </StaggerItem>
              ) : null}

              <StaggerItem y={14}>
                <h1 className="font-heading text-xl md:text-3xl font-semibold whitespace-pre-line">
                  {card.title}
                </h1>
              </StaggerItem>

              {card.description ? (
                <StaggerItem y={12}>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {card.description}
                  </p>
                </StaggerItem>
              ) : null}

              {card.cta?.href && card.cta?.label ? (
                <StaggerItem y={10}>
                  <div className="pt-2">
                    {card.cta.href.startsWith("/") ||
                    card.cta.href.startsWith("#") ? (
                      <Button asChild size="lg">
                        <Link href={card.cta.href}>{card.cta.label}</Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg">
                        <a
                          href={card.cta.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {card.cta.label}
                        </a>
                      </Button>
                    )}
                  </div>
                </StaggerItem>
              ) : null}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
