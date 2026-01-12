"use client";

import { JSX } from "react";
import {
  Target,
  Eye,
  Rocket,
  Award,
  SlidersHorizontal,
  Clock,
  Wallet,
} from "lucide-react";
import type { AboutValuesSectionV1 } from "@/config/types/pages/About/about-sections.types";
import { SectionReveal } from "@/shared/animations/section-reveal";

const ICONS: Record<string, JSX.Element> = {
  goal: <Target className="h-8 w-8 text-primary" />,
  vision: <Eye className="h-8 w-8 text-primary" />,
  mission: <Rocket className="h-8 w-8 text-primary" />,

  award: <Award className="h-8 w-8 text-primary" />,
  sliders: <SlidersHorizontal className="h-8 w-8 text-primary" />,
  clock: <Clock className="h-8 w-8 text-primary" />,
  wallet: <Wallet className="h-8 w-8 text-primary" />,
};

export default function AboutValuesSection({
  config,
}: {
  config: AboutValuesSectionV1;
}) {
  if (config.enabled === false) return null;

  const bgClass = config.layout?.backgroundClassName ?? "bg-muted";
  const columns = config.layout?.columns ?? 3;

  const gridCols =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-3";

  return (
    <SectionReveal>
      <section className={`w-full ${bgClass} py-14 md:py-18`}>
        <div className="mx-auto w-[95%]">
          {(config.title || config.subtitle) && (
            <div className="mb-10 md:mb-14 text-center flex flex-col items-center">
              {config.title ? (
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {config.title}
                </h2>
              ) : null}

              {config.subtitle ? (
                <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                  {config.subtitle}
                </p>
              ) : null}
            </div>
          )}

          <div className={`grid ${gridCols} gap-8 md:gap-10`}>
            {config.items.map((item, idx) => {
              const iconKey = item.icon ?? item.key; // ✅ supports both shapes
              return (
                <div
                  key={`${item.key}-${idx}`}
                  className="flex flex-col items-center text-center px-4"
                >
                  <div className="mb-4 flex items-center justify-center h-14 w-14">
                    {ICONS[iconKey] ?? null}
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
