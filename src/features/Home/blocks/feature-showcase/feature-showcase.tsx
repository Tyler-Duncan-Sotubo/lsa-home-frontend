"use client";

import { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Check, Zap, Factory, PencilRuler, Boxes } from "lucide-react";
import type { FeatureShowcaseSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import { RevealFromSide } from "@/shared/animations/reveal-from-side";
import { SectionReveal } from "@/shared/animations/section-reveal";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";

const ICONS: Record<string, JSX.Element> = {
  check: <Check className="h-9 w-9 text-primary" />,
  bolt: <Zap className="h-9 w-9 text-primary" />,
  factory: <Factory className="h-9 w-9 text-primary" />,
  customize: <PencilRuler className="h-9 w-9 text-primary" />,
  oneStop: <Boxes className="h-9 w-9 text-primary" />,
};

export function FeatureShowcaseSection({
  config,
}: {
  config: FeatureShowcaseSectionV1;
}) {
  const align = config.layout?.align ?? "left";
  const overlayClass = config.overlay?.className ?? "bg-black/20";
  const imageRight = config.layout?.imagePosition === "right";

  const contentPaddingClass = imageRight
    ? "px-6 md:pl-10 md:pr-0"
    : "px-6 md:pl-8 md:pr-10";

  const contentAlignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  const imageRevealDirection = imageRight ? "right" : "left";

  return (
    <section
      // clip is more reliable than hidden for transformed children on mobile
      className={`w-full overflow-x-clip ${imageRight ? "" : "bg-muted"}`}
    >
      <div className="w-full max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch gap-10 w-full max-w-full">
          {/* Image column */}
          <div
            className={`flex w-full max-w-full min-w-0 items-center justify-center ${
              imageRight ? "md:order-2" : "md:order-1"
            }`}
          >
            <RevealFromSide
              direction={imageRevealDirection}
              distance={28}
              // hard clamp: prevent the animated wrapper from ever exceeding viewport width
              className="w-full max-w-[100vw] overflow-hidden"
            >
              <div className="relative w-full max-w-full overflow-hidden aspect-square md:min-h-80">
                <Image
                  src={config.image.src}
                  alt={config.image.alt ?? "Section image"}
                  fill
                  className="object-cover"
                  sizes="100vw, (min-width: 768px) 50vw"
                  // priority={Boolean(config.image?.priority)}
                />
                <div className={`absolute inset-0 ${overlayClass}`} />
              </div>
            </RevealFromSide>
          </div>

          {/* Content column */}
          <div
            className={`flex w-full max-w-full min-w-0 items-center ${
              imageRight ? "md:order-1" : "md:order-2"
            }`}
          >
            {/* Constant on mobile: no aspect constraints. Square only on md+ if you really want it. */}
            <div className="w-full max-w-2xl min-w-0 md:aspect-square flex items-center">
              <div
                className={`${contentPaddingClass} w-full max-w-xl min-w-0 flex flex-col ${contentAlignClass}`}
              >
                <SectionReveal y={14}>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {config.content.title}
                  </h2>

                  {config.content.subtitle ? (
                    <p className="mt-4 text-base md:text-lg text-muted-foreground">
                      {config.content.subtitle}
                    </p>
                  ) : null}
                </SectionReveal>

                {config.content.paragraphs?.length ? (
                  <Stagger
                    className="mt-6 space-y-4 w-full min-w-0"
                    delayChildren={0.08}
                    staggerChildren={0.08}
                  >
                    {config.content.paragraphs.map((text, idx) => (
                      <StaggerItem key={idx} y={10}>
                        <p className="text-base text-secondary-foreground wrap-break-word">
                          {text}
                        </p>
                      </StaggerItem>
                    ))}
                  </Stagger>
                ) : null}

                {!config.content.paragraphs?.length &&
                config.content.bullets?.length ? (
                  <Stagger
                    className="mt-8 w-full min-w-0"
                    delayChildren={0.08}
                    staggerChildren={0.08}
                  >
                    <ul className="space-y-5 w-full min-w-0">
                      {config.content.bullets.map((item, idx) => {
                        const isString = typeof item === "string";
                        const text = isString ? item : item.text;
                        const iconKey = isString ? null : item.icon;

                        return (
                          <StaggerItem key={idx} y={10}>
                            <li className="flex items-start gap-4 min-w-0 w-full">
                              {iconKey && ICONS[iconKey] ? (
                                <span className="shrink-0">
                                  {ICONS[iconKey]}
                                </span>
                              ) : null}

                              <span className="text-base md:text-lg text-foreground font-medium min-w-0 wrap-break-word">
                                {text}
                              </span>
                            </li>
                          </StaggerItem>
                        );
                      })}
                    </ul>
                  </Stagger>
                ) : null}

                {config.content.cta ? (
                  <SectionReveal className="mt-10" delay={0.12} y={10}>
                    <Link href={config.content.cta.href}>
                      <Button size="lg">{config.content.cta.label}</Button>
                    </Link>
                  </SectionReveal>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
