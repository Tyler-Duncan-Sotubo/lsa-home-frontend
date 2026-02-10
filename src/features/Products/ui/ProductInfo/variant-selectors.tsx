/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { colorSwatchMap } from "@/shared/constants/product-colors";
import { ProductGalleryProps } from "@/features/Products/types/products";
import { Button } from "../../../../shared/ui/button";

type WCProduct = ProductGalleryProps["product"];
type WCAttribute = NonNullable<WCProduct["attributes"]>[number];

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

/**
 * Admin-known option names
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OPTION_PRESETS = [
  { value: "Color", label: "Color" },
  { value: "Size", label: "Size" },
  { value: "Material", label: "Material" },
  { value: "Style", label: "Style" },
  { value: "Type", label: "Type" },
] as const;

type PresetName = (typeof OPTION_PRESETS)[number]["value"];

interface VariantSelectorsProps {
  colorAttributes: WCAttribute[];
  sizeAttributes: WCAttribute[];
  /**
   * ✅ NEW: pass other preset attributes from parent when they exist
   * e.g. { Material: attrObj, Style: attrObj, Type: attrObj }
   */
  extraAttributes?: Partial<Record<PresetName, WCAttribute>>;

  selectedColor: string | null;
  selectedSize: string | null;

  /**
   * ✅ NEW: selection + handler for extras
   */
  selectedExtras?: Partial<Record<PresetName, string | null>>;
  onSelectExtra?: (name: PresetName, option: string) => void;

  onSelectColor?: (color: string) => void;
  onSelectSize?: (size: string) => void;

  variations?: WCProduct["variations"];
}

export function VariantSelectors({
  colorAttributes,
  sizeAttributes,
  extraAttributes,

  selectedColor,
  selectedSize,
  selectedExtras,
  onSelectExtra,

  onSelectColor,
  onSelectSize,
  variations,
}: VariantSelectorsProps) {
  const firstColor = colorAttributes[0]?.options?.[0] ?? "";
  const firstSize = sizeAttributes[0]?.options?.[0] ?? "";

  const effectiveColor = selectedColor ?? firstColor;
  const effectiveSize = selectedSize ?? firstSize;

  const isColorSelected = (opt: string) =>
    effectiveColor && norm(effectiveColor) === norm(opt);

  const isSizeSelected = (opt: string) =>
    effectiveSize && norm(effectiveSize) === norm(opt);

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

  /**
   * ✅ NEW: generic stock disabling for ANY attribute option
   * It checks:
   * - the option for the attribute we are evaluating (attrName)
   * - and the current "context" selections (color/size + extras)
   */
  const isOptionOutOfStock = (attrName: string, optionValue: string) => {
    const vars = (variations as any[]) ?? [];

    // If we don't have real variation objects (e.g. just IDs), don't disable anything
    if (
      !Array.isArray(vars) ||
      vars.length === 0 ||
      typeof vars[0] !== "object"
    ) {
      return false;
    }

    const targetAttr = norm(attrName);
    const targetOpt = norm(optionValue);

    // Build current selection context (what user already picked)
    const context: Record<string, string> = {};
    if (effectiveColor) context["color"] = norm(effectiveColor);
    if (effectiveSize) context["size"] = norm(effectiveSize);

    const extras = selectedExtras ?? {};
    for (const key of ["Material", "Style", "Type"] as PresetName[]) {
      const v = extras[key];
      if (v) context[norm(key)] = norm(v);
    }

    // We are testing this candidate option, so override its key in context:
    context[targetAttr] = targetOpt;

    const matching = vars.filter((v) => {
      const attrs: any[] = v.attributes ?? [];

      // For every context key, the variation must match that attr (if it exists in variation)
      // If variation doesn't have that attr at all, treat as non-match.
      return Object.entries(context).every(([k, desired]) => {
        const found = attrs.find((a) => {
          const n = norm(a?.name);
          // match either exact or includes (handles pa_material etc)
          return n === k || n.includes(k);
        });

        return norm(found?.option ?? null) === desired;
      });
    });

    if (matching.length === 0) return false;

    // Disable only if *all* matching are out of stock
    return matching.every(isVariationOutOfStock);
  };

  const renderExtraSelector = (name: PresetName) => {
    const attr = extraAttributes?.[name];
    if (!attr?.options?.length) return null;

    const effective = selectedExtras?.[name] ?? attr.options[0] ?? "";

    const isSelected = (opt: string) => norm(opt) === norm(effective);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium uppercase tracking-wide text-primary">
            {name}
          </span>
          <span className="text-sm font-semibold">{effective}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {attr.options.map((opt) => {
            const selected = isSelected(opt);
            const disabled = isOptionOutOfStock(name, opt);

            return (
              <Button
                key={opt}
                type="button"
                variant="outline"
                onClick={() => !disabled && onSelectExtra?.(name, opt)}
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
    );
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
              const bg = colorSwatchMap[opt] ?? "#e5e7eb";

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
              const disabled = isOptionOutOfStock("Size", opt);

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

      {/* ✅ NEW: Extra preset selectors */}
      {renderExtraSelector("Material")}
      {renderExtraSelector("Style")}
      {renderExtraSelector("Type")}
    </div>
  );
}
