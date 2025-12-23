// src/components/CollectionFiltersSidebar.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { colorSwatchMap } from "@/shared/constants/product-colors";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import {
  CollectionFilterMeta,
  CollectionFiltersState,
} from "../actions/filters";

interface CollectionFiltersProps {
  meta: CollectionFilterMeta;
  filters: CollectionFiltersState;
  onChange: (next: CollectionFiltersState) => void;
}

export function CollectionFiltersSidebar({
  meta,
  filters,
  onChange,
}: CollectionFiltersProps) {
  const { allColors, allSizes, allTags } = meta;
  const { colors, sizes, tags } = filters;

  const update = (patch: Partial<CollectionFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  const toggleInArray = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const reset = () => {
    update({
      colors: [],
      sizes: [],
      tags: [],
    });
  };

  const activeCount = colors.length + sizes.length + tags.length;

  const activeChips: { type: "Color" | "Size" | "Style"; value: string }[] = [
    ...colors.map((c) => ({ type: "Color" as const, value: c })),
    ...sizes.map((s) => ({ type: "Size" as const, value: s })),
    ...tags.map((t) => ({ type: "Style" as const, value: t })),
  ];

  const removeChip = (chip: {
    type: "Color" | "Size" | "Style";
    value: string;
  }) => {
    if (chip.type === "Color") {
      update({ colors: colors.filter((c) => c !== chip.value) });
    } else if (chip.type === "Size") {
      update({ sizes: sizes.filter((s) => s !== chip.value) });
    } else {
      update({ tags: tags.filter((t) => t !== chip.value) });
    }
  };

  // Reuse the same content for mobile Sheet & desktop sidebar
  const renderFiltersContent = () => (
    <div className="space-y-3 bg-white p-4 h-full">
      {/* Header + count */}
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

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <Button
              key={`${chip.type}-${chip.value}`}
              type="button"
              onClick={() => removeChip(chip)}
              variant="outline"
              size="sm"
              className="
                flex items-center gap-1 rounded-full border
                bg-gray-50 text-xs text-gray-800 hover:bg-gray-50
              "
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

      {/* Colour filter – swatches */}
      {allColors.length > 0 && (
        <div className="space-y-2 ">
          <h3 className="text-lg font-semibold">Colour</h3>

          <div className="flex flex-col gap-2">
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
                    className={`
                      h-6 w-6 border 
                      ${selected ? "border-black" : "border-gray-300"}
                    `}
                    style={{ backgroundColor: swatchColor }}
                  />

                  <span
                    className={`
                      text-base 
                      ${selected ? "font-medium text-black" : "text-gray-800"}
                    `}
                  >
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size filter */}
      {allSizes.length > 0 && (
        <div className="space-y-2 mt-10">
          <h3 className="text-lg font-semibold">Size</h3>
          <div className="flex flex-col gap-2">
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
        </div>
      )}

      {/* "Style" filter (tags) */}
      {allTags.length > 0 && (
        <div className="space-y-2 mt-10">
          <h3 className="text-lg font-semibold">Style</h3>
          <div className="flex max-h-48 flex-col gap-2 overflow-auto pr-1">
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
        </div>
      )}

      {allColors.length === 0 &&
        allSizes.length === 0 &&
        allTags.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No filters available for this collection.
          </p>
        )}
    </div>
  );

  return (
    <>
      {/* Mobile: Filters button + Sheet */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
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
            <SheetTitle className="sr-only">Collection Filters</SheetTitle>
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

      {/* Desktop: static sidebar */}
      <aside className="hidden md:block md:w-64 lg:w-72">
        {renderFiltersContent()}
      </aside>
    </>
  );
}
