// app/products/[slug]/ProductPageClient.tsx
"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductDetailsPanel } from "@/components/products/product-details";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { RecentlyViewedRail } from "@/components/products/recently-view-products";
import { Product, ProductReview } from "@/types/products";
import { getCategoryHref } from "@/utils/getCategoryHref";
import { ProductReviews } from "@/components/products/reviews/product-reviews";
import { Element } from "react-scroll";
import { WriteReviewDialog } from "@/components/modals/write-review-dialog";
import { ProductRail } from "@/components/products/product-rail";
import { useRouter } from "next/navigation";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  user?: {
    name: string;
    email: string;
  } | null;
  reviews: ProductReview[];
}

export function ProductPageClient({
  product,
  user,
  relatedProducts,
  reviews,
}: ProductPageClientProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const handleWriteReview = () => setIsReviewDialogOpen(true);

  const handleReviewSubmitted = () => {
    router.refresh();
  };

  return (
    <section className="mx-auto w-[95%] py-8 ">
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

        <div>
          <ProductDetailsPanel
            product={product}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>
      </div>

      {/* You May Also Like - server-fetched, just rendered here */}
      {relatedProducts.length > 0 && (
        <ProductRail
          title="Shop the Collection"
          subtitle="Recommended picks based on this product’s category."
          products={relatedProducts}
          sectionClassName="mt-24"
        />
      )}

      <div className="mt-24">
        <Element name="reviews-section">
          <ProductReviews
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
            reviews={reviews} // ✅ pass server-fetched reviews
            onWriteReview={handleWriteReview}
          />
        </Element>
      </div>

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
    </section>
  );
}
