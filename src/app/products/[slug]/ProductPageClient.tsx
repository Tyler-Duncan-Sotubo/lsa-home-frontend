"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductDetailsPanel } from "@/components/products/product-details";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RecentlyViewedRail } from "@/components/products/recently-view-products";
import { Product } from "@/types/products";
import { getCategoryHref } from "@/utils/getCategoryHref";
import { ProductReviews } from "@/components/products/reviews/product-reviews";
import { Element } from "react-scroll";
import { WriteReviewDialog } from "@/components/modals/write-review-dialog";

interface ProductPageClientProps {
  product: Product;
  user?: {
    name: string;
    email: string;
  } | null;
}

export function ProductPageClient({ product, user }: ProductPageClientProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  console.log("Rendering ProductPageClient for product:", product);

  // Controls the review modal
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Optional: use this if ProductReviews needs a key to refetch reviews after submit
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  const handleWriteReview = () => {
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    // bump key so ProductReviews can refetch if it uses SWR/React Query etc.
    setReviewsRefreshKey((prev) => prev + 1);
  };

  return (
    <section className="mx-auto w-[95%] py-8 ">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },

          // Dynamically add all product categories:
          ...product.categories.map((cat) => ({
            label: cat.name,
            href: getCategoryHref(cat),
          })),

          // Finally, the product itself:
          { label: product.name },
        ]}
      />

      {/* Product layout */}
      <div className="grid md:grid-cols-[1.3fr_1fr] gap-3 md:gap-3 items-start mt-6">
        {/* LEFT: Gallery */}
        <div className="md:sticky md:top-24 self-start">
          <ProductGallery product={product} selectedColor={selectedColor} />
        </div>

        {/* RIGHT: Details */}
        <div>
          <ProductDetailsPanel
            product={product}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-24">
        <Element name="reviews-section">
          <ProductReviews
            key={reviewsRefreshKey}
            productId={product.id}
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
            onWriteReview={handleWriteReview}
          />
        </Element>
      </div>

      {/* Review dialog */}
      <WriteReviewDialog
        productId={product.id}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onSubmitted={handleReviewSubmitted}
        user={user}
      />

      {/* BELOW: Other sections (full width, after product section) */}
      <div className="mt-12">
        <RecentlyViewedRail currentSlug={product.slug} />
      </div>
    </section>
  );
}
