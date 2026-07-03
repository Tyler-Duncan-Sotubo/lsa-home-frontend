"use client";

import { HeroOneConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export function HeroOne({ config }: { config: HeroOneConfigV1 }) {
  const heightClass = config.layout?.heightClass ?? "h-[70vh] md:h-[85vh]";
  const overlayClass = config.overlay?.className ?? "bg-black/30";

  return (
    <section className={`relative w-full ${heightClass} overflow-hidden`}>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={config.video.poster}
      >
        <source
          src={config.video.src}
          type={config.video.type ?? "video/mp4"}
        />
      </video>

      <div className={`absolute inset-0 ${overlayClass}`} />

      <div
        className={
          config.layout?.contentClassName ??
          "relative z-10 flex h-full flex-col items-center justify-center text-center px-6"
        }
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl">
          {config.content.heading}
        </h1>

        {config.content.description ? (
          <p className="mt-4 max-w-lg text-xl md:text-4xl text-white/90 drop-shadow">
            {config.content.description}
          </p>
        ) : null}

        {config.content.cta ? (
          <Link href={config.content.cta.href} className="mt-6 transition">
            <Button>{config.content.cta.label}</Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
