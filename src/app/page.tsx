import BestSellersSection from "@/features/Home/ui/best-sellers";
import CategorySlider from "@/features/Home/ui/category-slider";
import HeroBanner from "@/features/Home/ui/HeroBanner";
import LatestSlider from "@/features/Home/ui/latest";
import SerenePromo from "@/features/Home/ui/serene-promo";
import { ProductRailSkeleton } from "@/features/products/ui/product-rail-skeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <CategorySlider />
      <Suspense
        fallback={
          <ProductRailSkeleton sectionClassName="w-[95%] mx-auto py-8" />
        }
      >
        <BestSellersSection />
        <SerenePromo />
        <LatestSlider />
      </Suspense>
    </div>
  );
}
