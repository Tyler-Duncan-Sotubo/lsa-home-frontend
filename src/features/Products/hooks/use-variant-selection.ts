/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

// Same preset list as ProductDetailsCartOne — kept in sync deliberately so a
// bundle component's picker resolves variants identically to a normal PDP.
const OPTION_PRESETS = [
  { value: "Color", label: "Color" },
  { value: "Size", label: "Size" },
  { value: "Material", label: "Material" },
  { value: "Style", label: "Style" },
  { value: "Type", label: "Type" },
] as const;

type PresetName = (typeof OPTION_PRESETS)[number]["value"];

export type VariantSelectionAttribute = {
  id?: number;
  name: string;
  variation?: boolean;
  options: string[];
};

export type VariantSelectionVariation = {
  id: string | number;
  attributes: { id?: number; name: string; option: string }[];
  [key: string]: any;
};

/**
 * Extracted from ProductDetailsCartOne: buckets a product's (or a bundle
 * component's) attributes into color/size/extras, tracks the customer's
 * picks, and resolves the concrete variation those picks map to — the same
 * selectionKey/variationIndex mechanism the normal PDP already uses, so a
 * bundle component's picker behaves identically. Deliberately NOT used by
 * ProductDetailsCartOne itself — that file is left untouched.
 */
export function useVariantSelection(
  attributes: VariantSelectionAttribute[] | undefined,
  variations: VariantSelectionVariation[] | undefined,
) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<
    Partial<Record<PresetName, string | null>>
  >({});

  const { colorAttributes, sizeAttributes, extraAttributes } = useMemo(() => {
    const attrs = attributes ?? [];
    const byPreset = new Map<PresetName, VariantSelectionAttribute[]>();
    for (const p of OPTION_PRESETS) byPreset.set(p.value, []);

    for (const a of attrs) {
      const name = String(a?.name ?? "");
      const hit = OPTION_PRESETS.find(
        (p) =>
          norm(p.value) === norm(name) || norm(name).includes(norm(p.value)),
      );
      if (hit) byPreset.get(hit.value)!.push(a);
    }

    const color = byPreset.get("Color") ?? [];
    const size = byPreset.get("Size") ?? [];

    const extras: Partial<Record<PresetName, VariantSelectionAttribute>> = {};
    for (const p of OPTION_PRESETS) {
      if (p.value === "Color" || p.value === "Size") continue;
      const list = byPreset.get(p.value) ?? [];
      if (list.length) extras[p.value] = list[0];
    }

    return {
      colorAttributes: color,
      sizeAttributes: size,
      extraAttributes: extras,
    };
  }, [attributes]);

  const firstColor = colorAttributes[0]?.options?.[0] ?? null;
  const firstSize = sizeAttributes[0]?.options?.[0] ?? null;

  const effectiveColor = selectedColor ?? firstColor;
  const effectiveSize = selectedSize ?? firstSize;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedExtras((prev) => {
      const next = { ...prev };
      (["Material", "Style", "Type"] as PresetName[]).forEach((k) => {
        const attr = extraAttributes[k];
        const first = attr?.options?.[0] ?? null;
        if (attr && next[k] == null) next[k] = first;
      });
      return next;
    });
  }, [extraAttributes]);

  const selectionKey = useMemo(() => {
    const parts: string[] = [];
    for (const p of OPTION_PRESETS) {
      if (p.value === "Color") {
        parts.push(norm(effectiveColor));
        continue;
      }
      if (p.value === "Size") {
        parts.push(norm(effectiveSize));
        continue;
      }
      parts.push(norm(selectedExtras[p.value] ?? null));
    }
    return parts.join("|");
  }, [effectiveColor, effectiveSize, selectedExtras]);

  const variationIndex = useMemo(() => {
    const vars = variations ?? [];
    const map = new Map<string, VariantSelectionVariation>();

    for (const v of vars) {
      const attrs = v?.attributes ?? [];
      const getOpt = (preset: PresetName) => {
        const found = attrs.find((a) => {
          const n = norm(a?.name);
          return n === norm(preset) || n.includes(norm(preset));
        });
        return norm(found?.option ?? null);
      };
      map.set(OPTION_PRESETS.map((p) => getOpt(p.value)).join("|"), v);
    }

    return map;
  }, [variations]);

  const activeVariation = useMemo(() => {
    const vars = variations ?? [];
    if (vars.length === 0) return null;
    return variationIndex.get(selectionKey) ?? vars[0] ?? null;
  }, [variationIndex, selectionKey, variations]);

  return {
    colorAttributes,
    sizeAttributes,
    extraAttributes,
    selectedColor: effectiveColor,
    selectedSize: effectiveSize,
    selectedExtras,
    setSelectedColor,
    setSelectedSize,
    setSelectedExtra: (name: PresetName, option: string) =>
      setSelectedExtras((p) => ({ ...p, [name]: option })),
    activeVariation,
  };
}
