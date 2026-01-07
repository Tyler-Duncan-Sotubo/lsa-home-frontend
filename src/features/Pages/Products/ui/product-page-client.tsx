"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { RecentlyViewedRail } from "@/features/Pages/Products/ui/recently-view-products";
import type {
  Product,
  ProductReview,
} from "@/features/Pages/Products/types/products";
import { getCategoryHref } from "@/shared/utils/getCategoryHref";
import { ProductReviews } from "@/features/reviews/ui/product-reviews";
import { Element } from "react-scroll";
import { WriteReviewDialog } from "@/features/reviews/ui/write-review-dialog";
import { useRouter } from "next/navigation";
import { ProductRail } from "./product-rail";
import { ProductDetailsTwo } from "./product-details-two";
import { ProductGallery } from "./product-gallery";
import { SectionReveal } from "@/shared/animations/section-reveal";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  user?: {
    name: string;
    email: string;
  } | null;
  reviews: ProductReview[];
}

function getFirstColor(product: Product): string | null {
  const colorAttr = product.attributes?.find((a) =>
    a.name.toLowerCase().includes("color")
  );
  return colorAttr?.options?.[0] ?? null;
}

export function ProductPageClient({
  product,
  user,
  relatedProducts,
  reviews,
}: ProductPageClientProps) {
  const router = useRouter();

  // ✅ set default color on FIRST render (prevents hero -> variant flicker)
  const [selectedColor, setSelectedColor] = useState<string | null>(() =>
    getFirstColor(product)
  );

  // eventized setter (always sees latest product)
  const resetSelectedColor = useEffectEvent((p: Product) => {
    setSelectedColor(getFirstColor(p));
  });

  // run only when the product identity changes
  useEffect(() => {
    resetSelectedColor(product);
  }, [product, product.id]); // or product.slug

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const handleWriteReview = () => setIsReviewDialogOpen(true);

  const handleReviewSubmitted = () => {
    router.refresh();
  };

  return (
    <section className="py-8">
      <div className="mx-auto w-[95%]">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...product.categories.map((cat) => ({
              label: cat.name,
              href: getCategoryHref(cat),
            })),
            { label: product.name },
          ]}
        />

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3 md:gap-3 items-start mt-6">
          <div className="md:sticky md:top-24 self-start">
            <ProductGallery product={product} selectedColor={selectedColor} />
          </div>
          <SectionReveal>
            <ProductDetailsTwo
              product={product}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />
          </SectionReveal>
        </div>
      </div>

      <div className="mt-24 bg-gray-50 p-10">
        <Element name="reviews-section">
          <ProductReviews
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
            reviews={reviews}
            onWriteReview={handleWriteReview}
          />
        </Element>
      </div>

      <div className="mx-auto w-[95%]">
        {relatedProducts.length > 0 && (
          <ProductRail
            title="Shop the Collection"
            subtitle="Recommended picks based on this product’s category."
            products={relatedProducts}
            sectionClassName="py-8 mt-24"
          />
        )}

        <WriteReviewDialog
          productId={product.id}
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          onSubmitted={handleReviewSubmitted}
          user={user}
          slug={product.slug}
        />

        <div className="mt-12">
          <RecentlyViewedRail currentSlug={product.slug} />
        </div>
      </div>
    </section>
  );
}
