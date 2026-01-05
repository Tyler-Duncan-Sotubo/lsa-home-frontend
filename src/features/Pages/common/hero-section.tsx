"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";
import { AboutHeroSectionV1 } from "@/config/types/pages/About/about-sections.types";

type Align = "left" | "center" | "right";

function getAlign(align: Align) {
  const block =
    align === "left" ? "mr-auto" : align === "right" ? "ml-auto" : "mx-auto";

  const flex =
    align === "left"
      ? "items-start"
      : align === "right"
      ? "items-end"
      : "items-center";

  return { block, flex };
}

export default function AboutHeroSection({
  config,
}: {
  config: AboutHeroSectionV1;
}) {
  if (config.enabled === false) return null;

  const align: Align = config.layout?.align ?? "center";

  const textAlign =
    config.layout?.textAlign ?? (align === "center" ? "center" : "auto");

  const textAlignClass =
    textAlign === "auto"
      ? ""
      : textAlign === "left"
      ? "text-left"
      : textAlign === "right"
      ? "text-right"
      : "text-center";

  const size = config.layout?.size ?? (align === "right" ? "sm" : "lg");
  const titleClass =
    size === "sm"
      ? "text-xl md:text-3xl"
      : size === "md"
      ? "text-2xl md:text-4xl"
      : "text-3xl md:text-5xl";
  const descClass =
    size === "sm"
      ? "text-sm md:text-base"
      : size === "md"
      ? "text-sm md:text-lg"
      : "text-base md:text-lg";

  const heightClass = config.layout?.heightClass ?? "min-h-[50svh]";
  const containerClassName =
    config.layout?.containerClassName ?? "w-[95%] mx-auto";
  const maxWidthClassName = config.layout?.maxWidthClassName ?? "max-w-4xl";

  const bgClass = config.background?.className ?? "bg-background";
  const bgImage = config.background?.image;
  const overlayClass = bgImage?.overlayClassName ?? "bg-black/40";

  const { block, flex } = getAlign(align);

  return (
    <section
      className={`relative w-full ${bgClass} ${heightClass} overflow-hidden`}
    >
      {/* Background image */}
      {bgImage?.src ? (
        <div className="absolute inset-0">
          <Image
            src={bgImage.src}
            alt={bgImage.alt ?? "Background image"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className={`absolute inset-0 ${overlayClass}`} />
        </div>
      ) : null}

      {/* Content */}
      <div className={`relative z-10 h-full ${containerClassName}`}>
        <div
          className={`h-full flex flex-col justify-center ${flex} py-16 md:py-20`}
        >
          <div
            className={`${block} w-full ${maxWidthClassName} ${textAlignClass}`}
          >
            {/* ✅ Animated content */}
            <Stagger
              className="space-y-3"
              delayChildren={0.05}
              staggerChildren={0.08}
            >
              {config.content.eyebrow ? (
                <StaggerItem>
                  <p className="text-xs md:text-xl font-medium tracking-wide text-secondary">
                    {config.content.eyebrow}
                  </p>
                </StaggerItem>
              ) : null}

              <StaggerItem y={14}>
                <h1
                  className={`mt-3 ${titleClass} font-bold text-secondary ${
                    align === "center" ? "" : "max-w-xl"
                  }`}
                >
                  {config.content.title}
                </h1>
              </StaggerItem>

              {config.content.description ? (
                <StaggerItem y={12}>
                  <p
                    className={`mt-5 ${descClass} font-semibold text-secondary`}
                  >
                    {config.content.description}
                  </p>
                </StaggerItem>
              ) : null}

              {config.content.cta ? (
                <StaggerItem y={10}>
                  <div className="mt-8">
                    <Link href={config.content.cta.href}>
                      <Button variant="clean">
                        {config.content.cta.label}
                      </Button>
                    </Link>
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
