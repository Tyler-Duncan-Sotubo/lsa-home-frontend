import BestSellersSection from "@/components/pages/Home/best-sellers";
import CategorySlider from "@/components/pages/Home/category-slider";
import HeroBanner from "@/components/pages/Home/HeroBanner";

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <CategorySlider />
      <BestSellersSection />
    </div>
  );
}
