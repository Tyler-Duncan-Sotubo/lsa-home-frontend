import type { HomeSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import TopCategories from "./top-categories";
import BrandCarousel from "./brand-carousel";
import LatestSlider from "./latest-products";
import { FeatureShowcaseSection } from "./feature-showcase-section";
import { TestimonialsSection } from "./testimonials-section";
import { HappyCustomersSection } from "./happy-customers-section";
import { ProductCategoryGridSection } from "./product-category-grid-section";
import { FeaturedProductSection } from "./featured-product-section";

export function HomeSections({ sections }: { sections?: HomeSectionV1[] }) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => {
        switch (section.type) {
          case "topCategories":
            return <TopCategories key={idx} config={section} />;
          case "featureShowcase":
            if (section.enabled === false) return null;
            return <FeatureShowcaseSection key={idx} config={section} />;
          case "brandCarousel":
            return <BrandCarousel key={idx} config={section} />;
          case "latestProducts":
            if (section.enabled === false) return null;
            return <LatestSlider key={idx} config={section} />;
          case "testimonials":
            if (section.enabled === false) return null;
            return <TestimonialsSection key={idx} config={section} />;
          case "happyCustomers":
            if (section.enabled === false) return null;
            return <HappyCustomersSection key={idx} config={section} />;
          case "productCategoryGrid":
            if (section.enabled === false) return null;
            return <ProductCategoryGridSection key={idx} config={section} />;
          case "featuredProduct":
            if (section.enabled === false) return null;
            return <FeaturedProductSection key={idx} config={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
