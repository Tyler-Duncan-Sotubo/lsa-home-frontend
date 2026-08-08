import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { PricingCardsSectionV1 } from "@/config/types/pages/Home/home-sections.types";

// Static, hand-authored service/pricing tiers — see the type comment in
// home-sections.types.ts for why this isn't backed by real products.
export function PricingCardsSection({
  config,
}: {
  config: PricingCardsSectionV1;
}) {
  if (config.enabled === false) return null;
  if (!config.tiers?.length) return null;

  const columns = config.layout?.columns ?? 4;

  const columnsClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="w-[95%] mx-auto py-16 md:py-20">
      {(config.eyebrow || config.title || config.subtitle) && (
        <div className="mb-12 max-w-2xl">
          {config.eyebrow && (
            <h2 className="font-heading text-3xl md:text-4xl font-normal text-primary">
              {config.eyebrow}
            </h2>
          )}
          {config.title && (
            <h3 className="font-heading text-3xl md:text-4xl font-normal text-foreground">
              {config.title}
            </h3>
          )}
          {config.subtitle && (
            <p className="mt-4 border-l-2 border-primary pl-4 text-lg text-muted-foreground">
              {config.subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 ${columnsClass}`}>
        {config.tiers.map((tier) => {
          const ctaLabel = tier.ctaLabel ?? config.ctaLabel;
          const ctaHref = tier.ctaHref ?? config.ctaHref;

          return (
            <div
              key={tier.id}
              className="flex flex-col rounded-lg border border-border bg-background p-8"
            >
              <h4 className="font-heading text-3xl font-normal text-foreground">
                {tier.title}
              </h4>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold text-primary">
                  {tier.price}
                </span>
                {tier.priceSuffix && (
                  <span className="text-base text-muted-foreground">
                    {tier.priceSuffix}
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-lg text-foreground"
                  >
                    <Check className="size-5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {ctaLabel && ctaHref && (
                <Link href={ctaHref} className="mt-8">
                  <Button variant="pill" className="w-full">
                    {ctaLabel}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
