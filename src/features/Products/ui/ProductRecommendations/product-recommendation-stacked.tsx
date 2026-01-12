import { Product } from "../../types/products";
import { ProductRail } from "../ProductRail/product-rail";
import { RecentlyViewedRail } from "./recently-view-products";

interface ProductRecommendationsStackedProps {
  productSlug: string;
  relatedProducts: Product[];
  className?: string;
}

export const ProductRecommendationsStacked = ({
  productSlug,
  relatedProducts,
  className,
}: ProductRecommendationsStackedProps) => {
  const hasRelated = relatedProducts.length > 0;

  return (
    <div className={className}>
      {hasRelated && (
        <ProductRail
          title="Shop the Collection"
          subtitle="Recommended picks based on this product’s category."
          products={relatedProducts}
          sectionClassName="py-8 mt-10"
        />
      )}
      <div className="mt-10">
        <RecentlyViewedRail currentSlug={productSlug} />
      </div>
    </div>
  );
};
