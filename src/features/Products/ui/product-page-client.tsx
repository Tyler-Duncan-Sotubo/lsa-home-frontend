"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import { Breadcrumb } from "@/shared/seo/breadcrumb";
import type {
  Product,
  ProductReview,
} from "@/features/Products/types/products";
import { getCategoryHref } from "@/shared/utils/getCategoryHref";
import { Element } from "react-scroll";
import { WriteReviewDialog } from "@/features/reviews/ui/write-review-dialog";
import { useRouter } from "next/navigation";
import { ProductGallery } from "./ProductGallery/product-gallery";
import { SectionReveal } from "@/shared/animations/section-reveal";
import { gaEvent } from "@/features/integrations/config/ga";
import { StorefrontConfigV1 } from "@/config/types/types";
import ProductDetails from "./ProductDetails/product-details";
import { ProductRecommendations } from "./ProductRecommendations/product-recommendation";
import { ProductDetailsUnderArea } from "./ProductDetails/product-details-under-area";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  user?: {
    name: string;
    email: string;
  } | null;
  reviews: ProductReview[];
  config: StorefrontConfigV1;
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
  config,
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
  }, [product, product.id]);

  const hasFiredViewRef = useRef<string | null>(null);

  useEffect(() => {
    // fire once per product id
    if (!product?.id) return;
    if (hasFiredViewRef.current === product.id) return;
    hasFiredViewRef.current = product.id;

    gaEvent("view_item", {
      currency: "NGN",
      value: product.price ?? product.regular_price ?? 0,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.categories?.[0]?.name ?? undefined,
          item_variant: selectedColor ?? undefined,
          price: product.price ?? product.regular_price ?? 0,
          quantity: 1,
        },
      ],
    });
  }, [
    product.categories,
    product.id,
    product.name,
    product.price,
    product.regular_price,
    selectedColor,
  ]); // keep it keyed to identity

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const handleWriteReview = () => setIsReviewDialogOpen(true);

  const handleReviewSubmitted = () => {
    router.refresh();
  };

  // config UI Settings
  const productUiConfig = config.ui?.product;
  const showInfoSections =
    productUiConfig?.productDetails?.showInfoSections ?? true;

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
            <ProductGallery
              product={product}
              selectedColor={selectedColor}
              config={productUiConfig}
            />
          </div>
          <SectionReveal>
            <ProductDetails
              config={productUiConfig}
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
          </SectionReveal>
        </div>
      </div>

      <div className="mt-24 bg-gray-50 px-10 py-8">
        <Element name="reviews-section">
          <ProductDetailsUnderArea
            product={product}
            showInfoSections={showInfoSections}
            defaultTab="description"
            reviews={reviews}
            onWriteReview={handleWriteReview}
          />
        </Element>
      </div>

      <div className="mx-auto w-[95%]">
        <ProductRecommendations
          product={product}
          relatedProducts={relatedProducts}
          config={productUiConfig}
          className="mt-24"
        />
      </div>
      <WriteReviewDialog
        productId={product.id}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onSubmitted={handleReviewSubmitted}
        user={user}
        slug={product.slug}
      />
    </section>
  );
}
