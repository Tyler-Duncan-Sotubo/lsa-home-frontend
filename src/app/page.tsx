import BestSellersSection from "@/components/Home/best-sellers";
import CategorySlider from "@/components/Home/category-slider";
import HeroBanner from "@/components/Home/HeroBanner";
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
