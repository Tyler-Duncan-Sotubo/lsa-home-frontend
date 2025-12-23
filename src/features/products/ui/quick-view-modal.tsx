/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { QuickViewDialogProps } from "@/features/products/types/products";
import { ProductGallery } from "./product-gallery";
import { ProductDetailsPanel } from "./product-details";
import LsaLoading from "../../../shared/ui/lsa-loading";

export function QuickViewDialog({
  open,
  product,
  onOpenChange,
}: QuickViewDialogProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Reset color when product changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedColor(null);
  }, [product]);

  // SAFE: hooks run even if product is null
  const hasFullVariations = useMemo(() => {
    if (!product) return false;

    const variations = (product as any).variations;
    return (
      Array.isArray(variations) &&
      variations.length > 0 &&
      typeof variations[0] === "object" &&
      "regular_price" in variations[0]
    );
  }, [product]);

  // Fetch enriched product only when needed
  const {
    data: fetchedProduct,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["quick-view-product", product?.slug],
    queryFn: async () => {
      const res = fetch(`/api/products/${product?.slug}`);
      if (!(await res).ok) {
        throw new Error("Failed to fetch product");
      }
      return (await res).json();
    },
    enabled: open && !!product && !hasFullVariations,
    staleTime: 1000 * 60 * 5,
  });

  // AFTER HOOKS: safe early return
  if (!product) return null;

  const productToUse = fetchedProduct ?? product;

  const loading = (isLoading || isFetching) && !hasFullVariations;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0 md:p-3 gap-0
          w-[90%] h-[95%] overflow-auto
          max-w-none sm:max-w-none
          sm:rounded-sm md:rounded-md
        "
      >
        <DialogTitle>
          <span className="sr-only">Quick view for {productToUse.name}</span>
        </DialogTitle>

        <div className="grid md:grid-cols-[1.5fr_1fr] gap-0 md:gap-1 h-full">
          <ProductGallery
            product={productToUse}
            selectedColor={selectedColor}
          />
          <ProductDetailsPanel
            product={productToUse}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            isModal
            onAddedToCart={() => onOpenChange(false)}
          />
        </div>

        {loading && <LsaLoading />}
      </DialogContent>
    </Dialog>
  );
}
