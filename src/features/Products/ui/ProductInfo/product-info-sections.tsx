"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import type { Product } from "@/features/Products/types/products";
import { buildProductSections } from "../../config/build-product-sections";

interface ProductInfoSectionsProps {
  product: Product;
}

export function ProductInfoSections({ product }: ProductInfoSectionsProps) {
  const sections = buildProductSections(product);

  const defaultOpen = sections[0]?.key;

  return (
    <section className="text-sm leading-relaxed text-muted-foreground">
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen}
        className="w-full"
      >
        {sections.map((section) => {
          const value = section.getValue(product) ?? "";
          return (
            <AccordionItem key={section.key} value={section.key}>
              <AccordionTrigger className="text-base font-semibold text-foreground">
                {section.title}
              </AccordionTrigger>

              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
