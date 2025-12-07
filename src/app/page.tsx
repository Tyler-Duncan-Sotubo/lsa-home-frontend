import BestSellersSection from "@/components/pages/Home/best-sellers";
import CategorySlider from "@/components/pages/Home/category-slider";
import HeroBanner from "@/components/pages/Home/HeroBanner";
import { ProductRailSkeleton } from "@/components/skeleton/product-rail-skeleton";
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
      </Suspense>
    </div>
  );
}
