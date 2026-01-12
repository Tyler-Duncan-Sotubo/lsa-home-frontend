// src/features/Shop/ui/shop-filters-sidebar.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { colorSwatchMap } from "@/shared/constants/product-colors";

export type ShopFiltersState = {
  colors: string[];
  sizes: string[];
  tags: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
};

export type ShopFilterMeta = {
  allColors: string[];
  allSizes: string[];
  allTags: string[];
  priceMin: number;
  priceMax: number;
};

interface ShopFiltersSidebarProps {
  meta: ShopFilterMeta;
  filters: ShopFiltersState;
  onChange: (next: ShopFiltersState) => void;
}

export function ShopFiltersSidebar({
  meta,
  filters,
  onChange,
}: ShopFiltersSidebarProps) {
  const { allColors, allSizes, allTags, priceMin, priceMax } = meta;
  const { colors, sizes, tags, minPrice, maxPrice } = filters;

  const update = (patch: Partial<ShopFiltersState>) =>
    onChange({ ...filters, ...patch });

  const toggleInArray = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const reset = () => {
    update({ colors: [], sizes: [], tags: [], minPrice: null, maxPrice: null });
  };

  const activeCount =
    colors.length +
    sizes.length +
    tags.length +
    (minPrice != null ? 1 : 0) +
    (maxPrice != null ? 1 : 0);

  const activeChips: {
    type: "Color" | "Size" | "Style" | "Price";
    value: string;
  }[] = [
    ...colors.map((c) => ({ type: "Color" as const, value: c })),
    ...sizes.map((s) => ({ type: "Size" as const, value: s })),
    ...tags.map((t) => ({ type: "Style" as const, value: t })),
    ...(minPrice != null
      ? [{ type: "Price" as const, value: `Min: ${minPrice}` }]
      : []),
    ...(maxPrice != null
      ? [{ type: "Price" as const, value: `Max: ${maxPrice}` }]
      : []),
  ];

  const removeChip = (chip: (typeof activeChips)[number]) => {
    if (chip.type === "Color")
      update({ colors: colors.filter((c) => c !== chip.value) });
    else if (chip.type === "Size")
      update({ sizes: sizes.filter((s) => s !== chip.value) });
    else if (chip.type === "Style")
      update({ tags: tags.filter((t) => t !== chip.value) });
    else if (chip.type === "Price") {
      if (chip.value.startsWith("Min:")) update({ minPrice: null });
      if (chip.value.startsWith("Max:")) update({ maxPrice: null });
    }
  };

  const renderFiltersContent = () => (
    <div className="space-y-3 bg-white p-4 h-full">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">
          <IoFilterSharp className="mr-2 inline-block align-middle" />
          <span className="align-middle">Filters</span>
        </h2>

        {activeCount > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {activeCount}
          </span>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <Button
              key={`${chip.type}-${chip.value}`}
              type="button"
              onClick={() => removeChip(chip)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 rounded-full border bg-gray-50 text-xs text-gray-800 hover:bg-gray-50"
            >
              <span>{chip.value}</span>
              <IoClose className="h-4 w-4 text-gray-400" />
            </Button>
          ))}
        </div>
      )}

      {activeCount > 0 && (
        <Button
          type="button"
          className="px-0 text-sm text-foreground underline"
          onClick={reset}
          variant="link"
        >
          Clear all
        </Button>
      )}

      <div className="h-px w-full bg-gray-100" />

      <Accordion
        type="multiple"
        defaultValue={[
          "price",
          allColors.length > 0 ? "colors" : "",
          allSizes.length > 0 ? "sizes" : "",
          allTags.length > 0 ? "style" : "",
        ].filter(Boolean)}
        className="w-full"
      >
        {/* Price */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-semibold">
            Price
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Min</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={priceMin}
                  max={priceMax}
                  value={minPrice ?? ""}
                  onChange={(e) =>
                    update({
                      minPrice:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  placeholder={`${priceMin}`}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Max</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={priceMin}
                  max={priceMax}
                  value={maxPrice ?? ""}
                  onChange={(e) =>
                    update({
                      maxPrice:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  placeholder={`${priceMax}`}
                />
              </label>

              <p className="col-span-2 text-xs text-muted-foreground">
                Range: {priceMin} – {priceMax}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Colour */}
        {allColors.length > 0 && (
          <AccordionItem value="colors">
            <AccordionTrigger className="text-lg font-semibold">
              Colour
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pt-2">
                {allColors.map((color) => {
                  const selected = colors.includes(color);
                  const swatchColor =
                    colorSwatchMap[color] ?? colorSwatchMap.Default;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        update({ colors: toggleInArray(colors, color) })
                      }
                      className="flex items-center gap-3 text-left"
                    >
                      <span
                        className={`h-6 w-6 border ${
                          selected ? "border-black" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: swatchColor }}
                      />
                      <span
                        className={`text-base ${
                          selected ? "font-medium text-black" : "text-gray-800"
                        }`}
                      >
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Size */}
        {allSizes.length > 0 && (
          <AccordionItem value="sizes">
            <AccordionTrigger className="text-lg font-semibold">
              Size
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pt-2">
                {allSizes.map((sizeValue) => {
                  const checked = sizes.includes(sizeValue);
                  return (
                    <label
                      key={sizeValue}
                      className="flex items-center gap-3 text-base text-gray-800"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          update({
                            sizes:
                              value === true
                                ? [...sizes, sizeValue]
                                : sizes.filter((s) => s !== sizeValue),
                          })
                        }
                        className="h-5 w-5"
                      />
                      <span>{sizeValue}</span>
                    </label>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Style */}
        {allTags.length > 0 && (
          <AccordionItem value="style">
            <AccordionTrigger className="text-lg font-semibold">
              Product Categories
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex max-h-48 flex-col gap-2 overflow-auto pr-1 pt-2">
                {allTags.map((tagValue) => {
                  const checked = tags.includes(tagValue);
                  return (
                    <label
                      key={tagValue}
                      className="flex items-center gap-3 text-base text-gray-800"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          update({
                            tags:
                              value === true
                                ? [...tags, tagValue]
                                : tags.filter((t) => t !== tagValue),
                          })
                        }
                        className="h-5 w-5"
                      />
                      <span>{tagValue}</span>
                    </label>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="clean"
              className="w-full justify-center gap-2"
              type="button"
            >
              <IoFilterSharp className="h-4 w-4" />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="p-0 overflow-y-auto w-full no-scrollbar"
          >
            <SheetTitle className="sr-only">Shop Filters</SheetTitle>
            <div className="pb-20">{renderFiltersContent()}</div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
              <SheetTrigger asChild>
                <Button className="w-full text-center font-medium" size="lg">
                  Apply Filters
                </Button>
              </SheetTrigger>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className="hidden md:block md:w-64 lg:w-72">
        <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
          {renderFiltersContent()}
        </div>
      </aside>
    </>
  );
}
