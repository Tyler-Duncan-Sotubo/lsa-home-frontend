"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { BundleComponentDetail } from "@/features/Products/types/products";
import { VariantSelectors } from "@/features/Products/ui/ProductInfo/variant-selectors";
import {
  useVariantSelection,
  type VariantSelectionVariation,
} from "@/features/Products/hooks/use-variant-selection";

interface BundleComponentCardProps {
  component: BundleComponentDetail;
  onVariantResolved: (variantId: string | null) => void;
}

export function BundleComponentCard({
  component,
  onVariantResolved,
}: BundleComponentCardProps) {
  const {
    colorAttributes,
    sizeAttributes,
    extraAttributes,
    selectedColor,
    selectedSize,
    selectedExtras,
    setSelectedColor,
    setSelectedSize,
    setSelectedExtra,
    activeVariation,
  } = useVariantSelection(
    component.attributes,
    component.variations as unknown as VariantSelectionVariation[],
  );

  const resolvedVariantId = activeVariation
    ? String(activeVariation.id)
    : null;

  // Report the resolved variant up so the parent can compute the live total
  // and assemble the final `selections[]` payload for add-to-bag.
  useEffect(() => {
    onVariantResolved(resolvedVariantId);
  }, [resolvedVariantId, onVariantResolved]);

  const image = component.image?.src;

  return (
    <div className="flex gap-4 sm:gap-6">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24">
        {image ? (
          <Image
            src={image}
            alt={component.name}
            fill
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        {component.quantity > 1 && (
          <p className="text-sm text-muted-foreground mb-1">
            Qty {component.quantity} included
          </p>
        )}

        <VariantSelectors
          colorAttributes={colorAttributes}
          sizeAttributes={sizeAttributes}
          extraAttributes={extraAttributes}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedExtras={selectedExtras}
          onSelectColor={setSelectedColor}
          onSelectSize={setSelectedSize}
          onSelectExtra={setSelectedExtra}
          variations={component.variations as never}
        />
      </div>
    </div>
  );
}
