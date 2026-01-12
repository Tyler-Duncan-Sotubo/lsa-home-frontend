"use client";

import React from "react";
import type {
  Product,
  ProductReview,
} from "@/features/Products/types/products";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ProductInfoSections } from "../ProductInfo/product-info-sections";
import { ProductReviews } from "@/features/reviews/ui/product-reviews";

// Replace this with your real reviews component
// import { ProductReviews } from "@/features/reviews/ui/product-reviews";

interface ProductDetailsUnderAreaProps {
  product: Product;
  showInfoSections: boolean;
  defaultTab?: "description" | "reviews";
  reviews: ProductReview[]; // ✅ now passed in from the page
  onWriteReview?: () => void;
}

export function ProductDetailsUnderArea({
  product,
  showInfoSections,
  defaultTab,
  reviews,
  onWriteReview: handleWriteReview,
}: ProductDetailsUnderAreaProps) {
  // If info sections are shown elsewhere, we only show reviews here.
  if (showInfoSections) {
    return (
      <section className="mt-10">
        <ProductReviews
          averageRating={product.average_rating}
          ratingCount={product.rating_count}
          reviews={reviews}
          onWriteReview={handleWriteReview}
        />
      </section>
    );
  }

  // Otherwise, show description + reviews in tabs.
  return (
    <section className="">
      <Tabs defaultValue={defaultTab ?? "description"} className="w-full">
        <TabsList className="mx-auto flex w-fit justify-center gap-6">
          <TabsTrigger
            value="description"
            className="text-base md:text-2xl font-medium px-6"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="text-base md:text-2xl font-medium px-6"
          >
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-8">
          <ProductInfoSections product={product} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-8">
          <ProductReviews
            averageRating={product.average_rating}
            ratingCount={product.rating_count}
            reviews={reviews}
            onWriteReview={handleWriteReview}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
