import { ProductRail } from "../ProductRail/product-rail";
import { RecentlyViewedRail } from "./recently-view-products";
import { Product } from "../../types/products";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

interface ProductRecommendationsTabbedProps {
  productSlug: string;
  relatedProducts: Product[];
  className?: string;
  defaultTab?: "recent" | "collection";
}

export const ProductRecommendationsTabbed = ({
  productSlug,
  relatedProducts,
  className,
  defaultTab,
}: ProductRecommendationsTabbedProps) => {
  const hasRelated = relatedProducts.length > 0;

  // If there are no related products, default to "recent" and hide the other tab.
  const initialTab: "recent" | "collection" =
    defaultTab ?? (hasRelated ? "collection" : "recent");

  return (
    <div className={className}>
      <div className="mt-12">
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="mx-auto flex w-fit justify-center gap-6">
            {hasRelated && (
              <TabsTrigger
                value="collection"
                className="text-base md:text-2xl font-medium px-6"
              >
                Related Products
              </TabsTrigger>
            )}
            <TabsTrigger
              value="recent"
              className="text-base md:text-2xl font-medium px-6"
            >
              Recently viewed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <RecentlyViewedRail
              currentSlug={productSlug}
              defaultTab={defaultTab}
            />
          </TabsContent>

          {hasRelated && (
            <TabsContent value="collection">
              <ProductRail
                title=""
                subtitle=""
                products={relatedProducts}
                sectionClassName="py-0"
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
