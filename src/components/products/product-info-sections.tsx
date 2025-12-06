"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CARE_BY_CATEGORY,
  DEFAULT_CARE_INSTRUCTIONS,
} from "@/constants/productCare";
import {
  DEFAULT_DIMENSIONS_COPY,
  DEFAULT_RETURNS_POLICY,
} from "@/constants/product-policy";
import type { Product } from "@/types/products";

export interface ProductGalleryProps {
  product: Product;
}

type MetaItem = {
  key: string;
  value: unknown;
};

function getMetaValue(product: Product, key: string): string | null {
  const meta = (product.meta_data as MetaItem[] | undefined) ?? [];
  const found = meta.find((m) => m.key === key);
  if (!found || found.value == null) return null;
  return String(found.value);
}

function getCategoryCare(product: Product): string | null {
  const categories = (product.categories ?? []) as { slug?: string }[];

  for (const cat of categories) {
    if (!cat.slug) continue;
    const care = CARE_BY_CATEGORY[cat.slug];
    if (care) return care;
  }

  return null;
}

interface ProductInfoSectionsProps {
  product: Product;
}

export function ProductInfoSections({ product }: ProductInfoSectionsProps) {
  const whyLove =
    getMetaValue(product, "why_love") || product.description || null;
  const howItFeels = getMetaValue(product, "how_it_feels");
  const howItLooks = getMetaValue(product, "how_it_looks");
  const detailsCopy = getMetaValue(product, "details_copy");

  // Care: product meta → category default → global default
  const careInstructions =
    getMetaValue(product, "care_instructions") ||
    getCategoryCare(product) ||
    DEFAULT_CARE_INSTRUCTIONS;

  // Returns / dimensions: product meta → global defaults
  const returnsPolicy =
    getMetaValue(product, "returns_policy") || DEFAULT_RETURNS_POLICY;

  const dimensionsCopy =
    getMetaValue(product, "dimensions_copy") || DEFAULT_DIMENSIONS_COPY;

  return (
    <section className="text-sm leading-relaxed text-muted-foreground">
      <Accordion
        type="single"
        collapsible
        defaultValue={
          whyLove ? "why-love" : detailsCopy ? "details" : undefined
        }
        className="w-full"
      >
        {/* Why you'll love it */}
        {whyLove && (
          <AccordionItem value="why-love">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Why You&apos;ll Love It
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{whyLove}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* How it feels / looks */}
        {(howItFeels || howItLooks) && (
          <AccordionItem value="feel-look">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              How It Feels &amp; Looks
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2">
                {howItFeels && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      How It Feels
                    </h3>
                    <p className="whitespace-pre-line">{howItFeels}</p>
                  </div>
                )}
                {howItLooks && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      How It Looks
                    </h3>
                    <p className="whitespace-pre-line">{howItLooks}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Details */}
        {detailsCopy && (
          <AccordionItem value="details">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Details
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: detailsCopy }}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Care */}
        {careInstructions && (
          <AccordionItem value="care">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Care
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{careInstructions}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Returns */}
        {returnsPolicy && (
          <AccordionItem value="returns">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Returns
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{returnsPolicy}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Dimensions */}
        {dimensionsCopy && (
          <AccordionItem value="dimensions">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Dimensions
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{dimensionsCopy}</p>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </section>
  );
}
