"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import type { AboutSplitSectionV1 } from "@/config/types/pages/About/about-sections.types";
import { RevealFromSide } from "@/shared/animations/reveal-from-side";

type Align = "left" | "center" | "right";

function getAlignClasses(align: Align) {
  // Controls text alignment only
  switch (align) {
    case "center":
      return { text: "text-center", items: "items-center" };
    case "right":
      return { text: "text-right", items: "items-end" };
    case "left":
    default:
      return { text: "text-left", items: "items-start" };
  }
}

export default function AboutSplitSection({
  config,
}: {
  config: AboutSplitSectionV1;
}) {
  if (config.enabled === false) return null;

  const imagePosition = config.layout?.imagePosition ?? "right";
  const align: Align = (config.layout?.align as Align) ?? "left";

  const bgClass = config.layout?.backgroundClassName ?? "bg-background";
  const heightClass = config.layout?.heightClass ?? "";

  const overlayClass = config.overlay?.className ?? "bg-black/0";

  const { text, items } = getAlignClasses(align);

  const imageColOrder = imagePosition === "right" ? "md:order-2" : "md:order-1";
  const contentColOrder =
    imagePosition === "right" ? "md:order-1" : "md:order-2";

  return (
    <section className={`w-full ${bgClass} ${heightClass}`}>
      <div className="mx-auto w-[95%] max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch gap-10">
          {/* Image column */}
          <div className={`relative ${imageColOrder}`}>
            <div className="relative w-full h-full min-h-80 overflow-hidden rounded-2xl">
              <Image
                src={config.image.src}
                alt={config.image.alt ?? "Section image"}
                fill
                className="object-cover"
                sizes="100vw, (min-width: 768px) 50vw"
              />
              <div className={`absolute inset-0 ${overlayClass}`} />
            </div>
          </div>

          {/* Content column */}

          <div className={`flex ${contentColOrder}`}>
            <div
              className={`w-full flex flex-col justify-center ${items} py-6 md:py-10`}
            >
              <RevealFromSide direction="up" delay={0.1}>
                <div className={`max-w-xl ${text}`}>
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                    {config.content.title}
                  </h2>

                  {config.content.subtitle ? (
                    <p className="mt-3 text-base md:text-lg text-muted-foreground">
                      {config.content.subtitle}
                    </p>
                  ) : null}

                  {config.content.paragraphs?.length ? (
                    <div className="mt-6 space-y-4">
                      {config.content.paragraphs.map((p, idx) => (
                        <p
                          key={idx}
                          className="text-base text-secondary-foreground"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {!config.content.paragraphs?.length &&
                  config.content.bullets?.length ? (
                    <ul className="mt-6 space-y-3">
                      {config.content.bullets.map((b, idx) => (
                        <li
                          key={idx}
                          className="text-base text-secondary-foreground"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {config.content.cta ? (
                    <div className="mt-8">
                      <Link href={config.content.cta.href}>
                        <Button size="lg">{config.content.cta.label}</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </RevealFromSide>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
