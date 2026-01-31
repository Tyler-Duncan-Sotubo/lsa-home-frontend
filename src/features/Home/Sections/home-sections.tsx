// src/features/Home/sections/home-sections.tsx
import { Suspense } from "react";
import type { HomeSectionV1 } from "@/config/types/pages/Home/home-sections.types";

import TopCategories from "./top-categories";
import BrandCarousel from "./brand-carousel";
import { FeatureShowcaseSection } from "./feature-showcase-section";
import { TestimonialsSection } from "./testimonials-section";
import { HappyCustomersSection } from "./happy-customers-section";
import { FeaturedProductSection } from "./featured-product-section";
import ProductTabsRailSection from "./product-tabs-rail-section";
import LatestProductsSection from "./latest-products-section";
import OnSaleProductsSection from "./on-sale-products-section";
import BestSellersProductsSection from "./best-sellers-products-section";
import ProductCategoryGridSection from "./product-category-grid-section";
import {
  CategoryGridSkeleton,
  ProductRailSkeleton,
  TopCategoriesSkeleton,
} from "@/features/skeletons/ index";

// ✅ skeletons (server-safe)

export function HomeSections({ sections }: { sections?: HomeSectionV1[] }) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => {
        // optional: stable key (better than idx if you have an id)
        const key = `${section.type}-${idx}`;

        switch (section.type) {
          case "topCategories":
            return (
              <Suspense
                key={key}
                fallback={<TopCategoriesSkeleton count={12} />}
              >
                <TopCategories key={key} config={section} />
              </Suspense>
            );

          case "featureShowcase":
            if (section.enabled === false) return null;
            return <FeatureShowcaseSection key={key} config={section} />;

          case "brandCarousel":
            return <BrandCarousel key={key} config={section} />;

          case "productTabs":
            if (section.enabled === false) return null;
            // if this one fetches server-side data too, wrap it as well
            return <ProductTabsRailSection key={key} config={section} />;

          case "testimonials":
            if (section.enabled === false) return null;
            return <TestimonialsSection key={key} config={section} />;

          case "happyCustomers":
            if (section.enabled === false) return null;
            return <HappyCustomersSection key={key} config={section} />;

          case "productCategoryGrid":
            if (section.enabled === false) return null;
            return (
              <Suspense key={key} fallback={<CategoryGridSkeleton />}>
                <ProductCategoryGridSection config={section} />
              </Suspense>
            );

          case "featuredProduct":
            if (section.enabled === false) return null;
            // wrap only if it awaits
            return <FeaturedProductSection key={key} config={section} />;

          case "latestProducts":
            if (section.enabled === false) return null;
            return (
              <Suspense key={key} fallback={<ProductRailSkeleton />}>
                <LatestProductsSection config={section} />
              </Suspense>
            );

          case "onSaleProducts":
            if (section.enabled === false) return null;
            return (
              <Suspense
                key={key}
                fallback={<ProductRailSkeleton count={section.limit ?? 6} />}
              >
                <OnSaleProductsSection config={section} />
              </Suspense>
            );

          case "bestSellersProducts":
            if (section.enabled === false) return null;
            return (
              <Suspense
                key={key}
                fallback={<ProductRailSkeleton count={section.limit ?? 6} />}
              >
                <BestSellersProductsSection config={section} />
              </Suspense>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
