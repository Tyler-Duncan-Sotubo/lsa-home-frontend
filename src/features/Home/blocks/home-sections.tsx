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
import LocalGallery from "./local-gallery";

export function HomeSections({ sections }: { sections?: HomeSectionV1[] }) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => {
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

          case "localGallery":
            if (section.enabled === false) return null;
            console.warn(
              "Rendering local gallery section. Ensure that the images are optimized for web and that the number of images is reasonable to avoid performance issues.",
            );
            return <LocalGallery key={key} config={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
