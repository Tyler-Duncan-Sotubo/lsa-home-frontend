"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FeaturedProductSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import { ProductGallery } from "@/features/Pages/Products/ui/product-gallery";
import { ProductDetailsTwo } from "@/features/Pages/Products/ui/product-details-two";
import { Skeleton } from "@/shared/ui/skeleton";

import { RevealFromSide } from "@/shared/animations/reveal-from-side";
import { SectionReveal } from "@/shared/animations/section-reveal";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";

export function FeaturedProductSection({
  config,
}: {
  config?: FeaturedProductSectionV1;
}) {
  const enabled = config?.enabled !== false;
  const slug = config?.slug ?? null;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [previousSlug, setPreviousSlug] = useState<string | null>(slug);

  // ✅ Reset selectedColor when slug changes (safe: runs after render)
  useEffect(() => {
    if (slug !== previousSlug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedColor(null);
      setPreviousSlug(slug);
    }
  }, [slug, previousSlug]);

  const {
    data: product,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["featured-product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ AFTER hooks: safe early returns
  if (!enabled) return null;
  if (!slug) return null;

  const loading = isLoading || isFetching;

  if (loading) {
    return (
      <section
        className={config?.layout?.sectionClassName ?? "w-[95%] mx-auto py-12"}
      >
        <SectionReveal>
          <Skeleton className="h-8 w-1/3 mb-6" />
        </SectionReveal>
      </section>
    );
  }

  if (!product) return null;

  const imageRight = config?.layout?.imagePosition === "right";
  const sectionClassName =
    config?.layout?.sectionClassName ?? "w-[95%] mx-auto py-12";

  const galleryDir = imageRight ? "right" : "left";
  const detailsDir = imageRight ? "left" : "right";

  return (
    <section className={sectionClassName}>
      {(config?.title || config?.subtitle) && (
        <SectionReveal className="mb-10" y={14}>
          {config?.title && (
            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
              {config.title}
            </h2>
          )}
          {config?.subtitle && (
            <p className="mt-3 text-muted-foreground">{config.subtitle}</p>
          )}
        </SectionReveal>
      )}

      <Stagger
        className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-0 md:gap-4"
        delayChildren={0.06}
        staggerChildren={0.1}
      >
        <StaggerItem
          className={imageRight ? "md:order-2" : "md:order-1"}
          y={10}
        >
          <RevealFromSide direction={galleryDir} distance={22}>
            <ProductGallery product={product} selectedColor={selectedColor} />
          </RevealFromSide>
        </StaggerItem>

        <StaggerItem
          className={imageRight ? "md:order-1" : "md:order-2"}
          y={10}
        >
          <RevealFromSide direction={detailsDir} distance={22}>
            <ProductDetailsTwo
              product={product}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              isModal={true}
            />
          </RevealFromSide>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
