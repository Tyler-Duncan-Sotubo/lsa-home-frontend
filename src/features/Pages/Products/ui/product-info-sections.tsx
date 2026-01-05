"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import {
  CARE_BY_CATEGORY,
  DEFAULT_CARE_INSTRUCTIONS,
} from "@/shared/constants/productCare";
import {
  DEFAULT_DIMENSIONS_COPY,
  DEFAULT_RETURNS_POLICY,
} from "@/shared/constants/product-policy";
import type { Product } from "@/features/Pages/Products/types/products";

type MetaItem = {
  key: string;
  value: unknown;
};

function getMetaValue(product: Product, key: string): string | null {
  const meta = (product.meta_data as MetaItem[] | undefined) ?? [];
  const found = meta.find((m) => m.key === key);
  if (!found || found.value == null) return null;

  // allow strings/numbers/booleans/objects (objects become JSON)
  if (typeof found.value === "string") return found.value;
  if (typeof found.value === "number" || typeof found.value === "boolean")
    return String(found.value);

  try {
    return JSON.stringify(found.value);
  } catch {
    return String(found.value);
  }
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
  // ✅ NEW snake_case keys from backend
  const whyYouWillLoveIt =
    getMetaValue(product, "why_you_will_love_it") ||
    product.description ||
    null;

  const howItFeelsAndLooks = getMetaValue(product, "how_it_feels_and_looks");

  const details = getMetaValue(product, "details");

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
          whyYouWillLoveIt
            ? "why-love"
            : howItFeelsAndLooks
            ? "feel-look"
            : details
            ? "details"
            : undefined
        }
        className="w-full"
      >
        {/* Why you'll love it */}
        {whyYouWillLoveIt && (
          <AccordionItem value="why-love">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Why You&apos;ll Love It
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{whyYouWillLoveIt}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* How it feels & looks (single combined field now) */}
        {howItFeelsAndLooks && (
          <AccordionItem value="feel-look">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              How It Feels &amp; Looks
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{howItFeelsAndLooks}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Details */}
        {details && (
          <AccordionItem value="details">
            <AccordionTrigger className="text-base font-semibold text-foreground">
              Details
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: details }}
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
