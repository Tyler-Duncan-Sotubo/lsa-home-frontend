"use client";

import { Star } from "lucide-react";
import type { TestimonialsSectionV1 } from "@/config/types/pages/Home/home-sections.types";

export function TestimonialsSection({
  config,
}: {
  config: TestimonialsSectionV1;
}) {
  if (config.enabled === false) return null;

  const columns = config.layout?.columns ?? 2;

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="mx-auto w-[95%] max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="mt-4 text-sm md:text-base text-muted-foreground">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Grid */}
        <div
          className={`grid gap-8 ${
            columns === 1
              ? "grid-cols-1"
              : columns === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {config.items.map((item, idx) => (
            <figure
              key={idx}
              className="rounded-2xl border bg-muted p-6 md:p-8 flex flex-col justify-between"
            >
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < item.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm md:text-base leading-relaxed text-foreground">
                “{item.quote}”
              </blockquote>

              {/* Author */}
              <figcaption className="mt-6">
                <p className="font-semibold text-foreground">{item.name}</p>
                {item.role && (
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
