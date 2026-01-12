"use client";

import { HeroTwoConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroTwo({ config }: { config: HeroTwoConfigV1 }) {
  const heightClass = config.layout?.heightClass ?? "h-[70vh] md:h-[85vh]";
  const overlayClass = config.overlay?.className ?? "bg-black/40";
  const align = config.layout?.align ?? "left";

  const contentAlignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  const containerAlignClass =
    align === "center" ? "justify-center" : "justify-start";

  const stripEnabled = config.bottomStrip?.enabled ?? true;
  const stripClass =
    config.bottomStrip?.className ?? "bg-primary text-primary-foreground";

  return (
    <section className="w-full">
      <div className={`relative w-full ${heightClass} overflow-hidden`}>
        <Image
          src={config.image.src}
          alt={config.image.alt ?? "Hero background"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className={`absolute inset-0 ${overlayClass}`} />

        <div
          className={`relative z-10 h-full px-6 md:px-10 flex ${containerAlignClass}`}
        >
          {/* ✅ Wrap hero content in Stagger */}
          <Stagger
            className={`w-full max-w-3xl flex flex-col justify-center ${contentAlignClass}`}
            delayChildren={0.05}
            staggerChildren={0.08}
          >
            {config.content.eyebrow ? (
              <StaggerItem>
                <h3 className="text-sm md:text-base font-semibold tracking-wide text-white/90 uppercase mb-6 drop-shadow-lg">
                  {config.content.eyebrow}
                </h3>
              </StaggerItem>
            ) : null}

            <StaggerItem y={14}>
              <h1 className="text-3xl md:text-6xl font-bold text-white drop-shadow-xl capitalize">
                {config.content.heading}
              </h1>
            </StaggerItem>

            {config.content.description ? (
              <StaggerItem y={12}>
                <p className="mt-6 text-base md:text-xl text-white/90 drop-shadow font-medium">
                  {config.content.description}
                </p>
              </StaggerItem>
            ) : null}

            {config.content.cta ? (
              <StaggerItem y={10}>
                <div className="mt-6 transition">
                  <Link href={config.content.cta.href}>
                    <Button>{config.content.cta.label}</Button>
                  </Link>
                </div>
              </StaggerItem>
            ) : null}
          </Stagger>
        </div>
      </div>

      {stripEnabled ? (
        <div className={`${stripClass} w-full text-center font-semibold`}>
          <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 text-sm md:text-lg">
            {config.bottomStrip?.text}
          </div>
        </div>
      ) : null}
    </section>
  );
}
