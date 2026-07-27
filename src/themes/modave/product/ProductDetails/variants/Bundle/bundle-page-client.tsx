"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Element } from "react-scroll";
import { toast } from "sonner";
import type {
  BundleDetail,
  Product,
  ProductReview,
} from "@/features/Products/types/products";
import { BundleComponentCard } from "./bundle-component-card";
import { BundleGallery } from "./bundle-gallery";
import { Button } from "@/shared/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui/accordion";
import { useMoney } from "@/shared/hooks/use-money";
import { useAppDispatch } from "@/store/hooks";
import { addBundleToCartAndSync } from "@/store/cart-sync-thunk";
import { ProductDetailsUnderArea } from "../../product-details-under-area";
import { ProductRecommendations } from "../../../ProductRecommendations/product-recommendation";
import { WriteReviewDialog } from "@/features/reviews/ui/write-review-dialog";
import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { getCategoryHref } from "@/shared/utils/getCategoryHref";
import type { StorefrontConfigV1 } from "@/config/types/types";

interface BundlePageClientProps {
  bundle: BundleDetail;
  product: Product;
  reviews: ProductReview[];
  relatedProducts: Product[];
  config: StorefrontConfigV1;
  user?: { name: string; email: string } | null;
}

export function BundlePageClient({
  bundle,
  product,
  reviews,
  relatedProducts,
  config,
  user,
}: BundlePageClientProps) {
  const formatMoney = useMoney();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const handleWriteReview = () => setIsReviewDialogOpen(true);
  const handleReviewSubmitted = () => router.refresh();

  const productUiConfig = config.ui?.product;

  const [selections, setSelections] = useState<Record<string, string | null>>(
    {},
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleVariantResolved = useCallback(
    (componentProductId: string, variantId: string | null) => {
      setSelections((prev) => {
        if (prev[componentProductId] === variantId) return prev;
        return { ...prev, [componentProductId]: variantId };
      });
    },
    [],
  );

  const allSelected = bundle.components.every(
    (c) => selections[c.componentProductId],
  );

  // Cumulative gallery: every component's own image plus any distinct
  // variation images, deduped by src — the bundle's own product row often
  // has no image of its own, and nothing here needs to swap per selection.
  const galleryItems = useMemo(() => {
    const seen = new Set<string>();
    const items: { id: string; src: string | null; alt: string }[] = [];

    for (const component of bundle.components) {
      const push = (src: string | null | undefined) => {
        if (!src || seen.has(src)) return;
        seen.add(src);
        items.push({ id: src, src, alt: component.name });
      };

      push(component.image?.src ?? null);

      for (const variation of component.variations) {
        push(variation.image?.src ?? null);
        for (const img of variation.images ?? []) {
          push(img?.src ?? null);
        }
      }
    }

    return items;
  }, [bundle.components]);

  const liveTotal = useMemo(() => {
    if (!allSelected) return null;

    let sum = 0;
    for (const component of bundle.components) {
      const variantId = selections[component.componentProductId];
      const variation = component.variations.find(
        (v) => String(v.id) === variantId,
      );
      if (!variation) return null;

      const price = Number(
        variation.sale_price || variation.price || variation.regular_price,
      );
      sum += price * component.quantity;
    }

    return Math.round(sum * (1 - bundle.discountPercent / 100) * 100) / 100;
  }, [allSelected, bundle.components, bundle.discountPercent, selections]);

  const handleAddToBag = async () => {
    if (!allSelected) {
      toast.error("Please choose an option for every item in the bundle.");
      return;
    }

    setIsAdding(true);
    try {
      const result = await dispatch(
        addBundleToCartAndSync({
          bundleProductId: bundle.id,
          quantity: 1,
          selections: bundle.components.map((c) => ({
            componentProductId: c.componentProductId,
            variantId: selections[c.componentProductId]!,
          })),
        }),
      );

      if (addBundleToCartAndSync.rejected.match(result)) {
        const payload = result.payload as { message?: string } | undefined;
        toast.error(payload?.message ?? "Unable to add bundle to cart");
        return;
      }

      toast.success("Added to bag");
    } finally {
      setIsAdding(false);
    }
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
            { label: bundle.name },
          ]}
        />

        <div className="grid items-start gap-3 mt-6 md:grid-cols-[1.3fr_1fr] md:gap-3">
          <div className="self-start md:sticky md:top-24">
            <BundleGallery items={galleryItems} />
          </div>

          <div className="flex flex-col">
            <header className="mb-2">
              <h1 className="text-lg font-semibold md:text-2xl">
                {bundle.name}
              </h1>
              {bundle.discountPercent > 0 && (
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Save {bundle.discountPercent}% as a bundle
                </span>
              )}
              {product.description && (
                <div
                  className="prose prose-sm prose-p:mt-0 prose-p:mb-2 mt-2 text-xs text-muted-foreground md:text-sm"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
            </header>

            <Accordion
              type="multiple"
              defaultValue={bundle.components.map(
                (c) => c.componentProductId,
              )}
            >
              {bundle.components.map((component, index) => (
                <AccordionItem
                  key={component.componentProductId}
                  value={component.componentProductId}
                >
                  <AccordionTrigger>
                    {index + 1}. Choose your {component.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <BundleComponentCard
                      component={component}
                      onVariantResolved={(variantId) =>
                        handleVariantResolved(
                          component.componentProductId,
                          variantId,
                        )
                      }
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6 flex flex-col gap-1">
              <span className="text-base font-semibold md:text-lg">
                {liveTotal != null
                  ? formatMoney(liveTotal)
                  : `${formatMoney(bundle.priceRange.min)} – ${formatMoney(bundle.priceRange.max)}`}
              </span>
              <p className="text-sm text-muted-foreground">
                Up to {formatMoney(bundle.valueTotal)} value
              </p>
              {bundle.discountPercent > 0 && (
                <p className="text-sm font-medium text-primary">
                  You save {bundle.discountPercent}%
                </p>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-6 w-full"
              disabled={!allSelected || isAdding}
              onClick={handleAddToBag}
            >
              {isAdding ? "Adding…" : "Add to bag"}
            </Button>

            {!allSelected && (
              <p className="mt-2 text-xs text-muted-foreground">
                Choose an option for every item to add this bundle.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-24 bg-gray-50 px-10 py-8">
        <Element name="reviews-section">
          <ProductDetailsUnderArea
            product={product}
            showInfoSections={false}
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
