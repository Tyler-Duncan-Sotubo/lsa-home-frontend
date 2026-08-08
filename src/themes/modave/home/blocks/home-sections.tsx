// src/features/Home/blocks/home-sections.tsx
import { Suspense } from "react";
import type { HomeSectionV1 } from "@/config/types/pages/Home/home-sections.types";

import TopCategories from "./categories/top-categories/top-categories";
import BrandCarousel from "./brand-carousel/brand-carousel";
import { FeatureShowcaseSection } from "./feature-showcase/feature-showcase";
import { TestimonialsSection } from "./social-proof/testimonials/testimonials";
import { HappyCustomersSection } from "./social-proof/happy-customers/happy-customers";
import { FeaturedProductSection } from "./product-rails/featured-product/featured-product";
import ProductTabsRailSection from "./product-rails/product-tabs-rail/product-tabs-rail";
import LatestProductsSection from "./product-rails/latest-products/latest-products";
import OnSaleProductsSection from "./product-rails/on-sale-products/on-sale-products";
import BestSellersProductsSection from "./product-rails/best-sellers-products/best-sellers-products";
import CategoryShowcaseSection from "./product-rails/category-showcase/category-showcase";
import ProductCategoryGridSection from "./categories/product-category-grid/product-category-grid";
import { PricingCardsSection } from "./pricing-cards/pricing-cards";
import {
  CategoryGridSkeleton,
  ProductRailSkeleton,
  TopCategoriesSkeleton,
} from "@/features/skeletons";

export function HomeSections({ sections }: { sections?: HomeSectionV1[] }) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => {
        const key =
          section.type === "categoryShowcase"
            ? `categoryShowcase-${section.id}`
            : `${section.type}-${idx}`;

        switch (section.type) {
          case "topCategories":
            if (section.enabled === false) return null;
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

          case "categoryShowcase":
            if (section.enabled === false) return null;
            return (
              <Suspense
                key={key}
                fallback={<ProductRailSkeleton count={section.limit ?? 6} />}
              >
                <CategoryShowcaseSection config={section} />
              </Suspense>
            );

          // localGallery moved to src/themes/andrea/home/blocks — built for
          // Emilia Duncan's bridal/beauty storefront, now owned by andrea.

          case "pricingCards":
            if (section.enabled === false) return null;
            return <PricingCardsSection key={key} config={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
