/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { colorSwatchMap } from "@/shared/constants/product-colors";
import { ProductGalleryProps } from "@/features/Products/types/products";
import { Button } from "../../../../shared/ui/button";

type WCProduct = ProductGalleryProps["product"];
type WCAttribute = NonNullable<WCProduct["attributes"]>[number];

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

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
  extraAttributes?: Partial<Record<PresetName, WCAttribute>>;
  selectedColor: string | null;
  selectedSize: string | null;
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

  // ─── Stock hint (never disables, just signals state) ──────────────────────
  const getOptionStockHint = (
    attrName: string,
    optionValue: string,
  ): "out" | "low" | "in" => {
    const vars = (variations as any[]) ?? [];

    if (
      !Array.isArray(vars) ||
      vars.length === 0 ||
      typeof vars[0] !== "object"
    ) {
      return "in";
    }

    const targetAttr = norm(attrName);
    const targetOpt = norm(optionValue);

    // Build context from current selections
    const context: Record<string, string> = {};
    if (effectiveColor) context["color"] = norm(effectiveColor);
    if (effectiveSize) context["size"] = norm(effectiveSize);

    const extras = selectedExtras ?? {};
    for (const key of ["Material", "Style", "Type"] as PresetName[]) {
      const v = extras[key];
      if (v) context[norm(key)] = norm(v);
    }

    // Override with the candidate option we are testing
    context[targetAttr] = targetOpt;

    const matching = vars.filter((v) => {
      const attrs: any[] = v.attributes ?? [];
      return Object.entries(context).every(([k, desired]) => {
        const found = attrs.find((a) => {
          const n = norm(a?.name);
          return n === k || n.includes(k);
        });
        return norm(found?.option ?? null) === desired;
      });
    });

    if (matching.length === 0) return "in";

    const allOut = matching.every((v) => {
      if (typeof v.stock_status === "string")
        return v.stock_status.toLowerCase() === "outofstock";
      if (typeof v.in_stock === "boolean") return v.in_stock === false;
      return false;
    });

    if (allOut) return "out";

    const anyLow = matching.some((v) => {
      const qty = Number(v.stock_quantity ?? 0);
      return v.manage_stock && qty > 0 && qty <= 3;
    });

    return anyLow ? "low" : "in";
  };

  // ─── Shared option button ─────────────────────────────────────────────────
  const OptionButton = ({
    opt,
    selected,
    hint,
    onClick,
  }: {
    opt: string;
    selected: boolean;
    hint: "in" | "low" | "out";
    onClick: () => void;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        className={[
          "relative px-5 py-2 border rounded-full text-sm transition-all",
          "hover:bg-primary hover:text-white",
          selected
            ? "border-primary bg-primary font-semibold border-none text-white"
            : "border-border bg-background text-primary",
          hint === "out" ? "opacity-60" : "",
        ].join(" ")}
      >
        {opt}
        {hint === "out" && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-muted-foreground border-2 border-background" />
        )}
        {hint === "low" && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-background" />
        )}
      </Button>
      {/* ✅ labels removed */}
    </div>
  );

  // ─── Extra selector (Material / Style / Type) ─────────────────────────────
  const renderExtraSelector = (name: PresetName) => {
    const attr = extraAttributes?.[name];
    if (!attr?.options?.length) return null;

    const effective = selectedExtras?.[name] ?? attr.options[0] ?? "";
    const isSelected = (opt: string) => norm(opt) === norm(effective);

    return (
      <div key={name} className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium uppercase tracking-wide text-primary">
            {name}
          </span>
          <span className="text-sm font-semibold">{effective}</span>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          {attr.options.map((opt) => (
            <OptionButton
              key={opt}
              opt={opt}
              selected={isSelected(opt)}
              hint={getOptionStockHint(name, opt)}
              onClick={() => onSelectExtra?.(name, opt)}
            />
          ))}
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

          <div className="flex flex-wrap gap-2 items-end">
            {colorAttributes[0].options?.map((opt) => {
              const selected = isColorSelected(opt);
              const hint = getOptionStockHint("Color", opt);
              const bg = colorSwatchMap[opt] ?? "#e5e7eb";

              return (
                <div key={opt} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectColor?.(opt)}
                    className={[
                      "h-9 w-9 rounded-full border flex items-center justify-center transition",
                      "hover:scale-105 hover:border-primary",
                      selected
                        ? "border-primary ring-2 ring-primary/60"
                        : "border-border",
                      hint === "out" ? "opacity-50" : "",
                    ].join(" ")}
                    aria-label={opt}
                  >
                    <span
                      className="h-7 w-7 rounded-full"
                      style={{ backgroundColor: bg }}
                    />
                  </button>
                </div>
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

          <div className="flex flex-wrap gap-2 items-end">
            {sizeAttributes[0].options?.map((opt) => (
              <OptionButton
                key={opt}
                opt={opt}
                selected={Boolean(isSizeSelected(opt))}
                hint={getOptionStockHint("Size", opt)}
                onClick={() => onSelectSize?.(opt)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Extra preset selectors */}
      {renderExtraSelector("Material")}
      {renderExtraSelector("Style")}
      {renderExtraSelector("Type")}
    </div>
  );
}
