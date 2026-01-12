/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { colorSwatchMap } from "@/shared/constants/product-colors";
import { ProductGalleryProps } from "@/features/Products/types/products";
import { Button } from "../../../../shared/ui/button";

type WCProduct = ProductGalleryProps["product"];
type WCAttribute = NonNullable<WCProduct["attributes"]>[number];

interface VariantSelectorsProps {
  colorAttributes: WCAttribute[];
  sizeAttributes: WCAttribute[];
  selectedColor: string | null;
  selectedSize: string | null;
  onSelectColor?: (color: string) => void;
  onSelectSize?: (size: string) => void;
  variations?: WCProduct["variations"];
}

export function VariantSelectors({
  colorAttributes,
  sizeAttributes,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  variations,
}: VariantSelectorsProps) {
  const firstColor = colorAttributes[0]?.options?.[0] ?? "";
  const firstSize = sizeAttributes[0]?.options?.[0] ?? "";

  const effectiveColor = selectedColor ?? firstColor;
  const effectiveSize = selectedSize ?? firstSize;

  const isColorSelected = (opt: string) =>
    effectiveColor && effectiveColor.toLowerCase() === opt.toLowerCase();

  const isSizeSelected = (opt: string) =>
    effectiveSize && effectiveSize.toLowerCase() === opt.toLowerCase();

  // Helper: is a single variation out of stock?
  const isVariationOutOfStock = (v: any) => {
    if (!v || typeof v !== "object") return false;

    if (typeof v.stock_status === "string") {
      return v.stock_status.toLowerCase() === "outofstock";
    }

    if (typeof v.in_stock === "boolean") {
      return v.in_stock === false;
    }

    return false;
  };

  const isSizeOptionOutOfStock = (sizeValue: string) => {
    const vars = (variations as any[]) ?? [];

    // If we don't have real variation objects (e.g. just IDs), don't disable anything
    if (
      !Array.isArray(vars) ||
      vars.length === 0 ||
      typeof vars[0] !== "object"
    ) {
      return false;
    }

    // Filter variations that match this size AND the currently selected color (if any)
    const matching = vars.filter((v) => {
      const attrs: any[] = v.attributes ?? [];

      const sizeAttr = attrs.find((a) =>
        a.name?.toLowerCase().includes("size")
      );
      const colorAttr = attrs.find((a) =>
        a.name?.toLowerCase().includes("color")
      );

      const sizeMatches =
        sizeAttr?.option?.toLowerCase() === sizeValue.toLowerCase();

      const colorMatches = effectiveColor
        ? colorAttr?.option?.toLowerCase() === effectiveColor.toLowerCase()
        : true; // if no color context, look at all colors

      return sizeMatches && colorMatches;
    });

    // No variations for that size/color → don't disable
    if (matching.length === 0) return false;

    // Disable only if *all* matching variations are out of stock
    return matching.every(isVariationOutOfStock);
  };

  return (
    <div className="flex flex-col space-y-5 my-3">
      {/* Colour selector */}
      {colorAttributes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Colour
            </span>
            <span className="text-sm font-bold">{effectiveColor}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {colorAttributes[0].options?.map((opt) => {
              const selected = isColorSelected(opt);
              const bg = colorSwatchMap[opt] ?? "#e5e7eb"; // fallback grey

              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => onSelectColor?.(opt)}
                  className={`
                    h-9 w-9 rounded-full border flex items-center justify-center
                    transition
                    hover:scale-105 hover:border-primary
                    ${
                      selected
                        ? "border-primary ring-2 ring-primary/60"
                        : "border-border"
                    }
                  `}
                  aria-label={opt}
                >
                  <span
                    className="h-7 w-7 rounded-full"
                    style={{ backgroundColor: bg }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizeAttributes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-primary">
              Size
            </span>
            <span className="text-sm font-semibold">{effectiveSize}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeAttributes[0].options?.map((opt) => {
              const selected = isSizeSelected(opt);
              const disabled = isSizeOptionOutOfStock(opt);

              return (
                <Button
                  key={opt}
                  type="button"
                  variant="outline"
                  onClick={() => !disabled && onSelectSize?.(opt)}
                  disabled={disabled}
                  className={`
                    px-5 py-2 border rounded-full text-sm
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primary hover:text-white"
                    }
                    ${
                      selected && !disabled
                        ? "border-primary bg-primary font-semibold border-none text-white"
                        : "border-border bg-background text-primary"
                    }
                  `}
                >
                  <span className={disabled ? "line-through opacity-60" : ""}>
                    {opt}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
