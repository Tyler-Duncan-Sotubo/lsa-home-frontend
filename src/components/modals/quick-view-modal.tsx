/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { QuickViewDialogProps } from "@/types/products";
import { ProductGallery } from "../products/product-gallery";
import { ProductDetailsPanel } from "../products/product-details";

export function QuickViewDialog({
  open,
  product,
  onOpenChange,
}: QuickViewDialogProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [fullProduct, setFullProduct] = useState<
    QuickViewDialogProps["product"] | null
  >(product);
  const [loading, setLoading] = useState(false);

  // Reset state when base product changes
  useEffect(() => {
    setFullProduct(product);
    setSelectedColor(null);
  }, [product]);

  // When dialog opens, fetch enriched product (with variations) if needed
  useEffect(() => {
    if (!open || !product) return;

    // If we already have variation objects, no need to fetch
    const variations = (product as any).variations;
    const hasFullVariations =
      Array.isArray(variations) &&
      variations.length > 0 &&
      typeof variations[0] === "object" &&
      "regular_price" in variations[0];

    if (hasFullVariations) {
      setFullProduct(product);
      return;
    }

    const fetchFullProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${product.id}`);
        if (!res.ok) {
          console.error("Failed to fetch full product", await res.text());
          setFullProduct(product);
          return;
        }

        const data = await res.json();
        setFullProduct(data);
      } catch (err) {
        console.error("Quick view fetch error", err);
        setFullProduct(product);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProduct();
  }, [open, product]);

  if (!product) return null;

  const productToUse = fullProduct ?? product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0 md:p-3 gap-0
          w-[90%] h-[90%]
          max-w-none sm:max-w-none
          sm:rounded-sm md:rounded-md
          overflow-hidden
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

        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40">
            <span className="text-xs text-muted-foreground">
              Loading details…
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
