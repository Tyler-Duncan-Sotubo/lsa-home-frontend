// src/config/buildProductSections.ts
import type { Product } from "@/features/Products/types/products";
import {
  BASE_SECTIONS,
  getCategoryHaystack,
  ProductSection,
  SECTION_RULES,
} from "./product-sections";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function mergeRules(product: Product) {
  const haystack = getCategoryHaystack(product);

  const includes = new Set<string>();
  const excludes = new Set<string>();
  const titleOverrides: Record<string, string> = {};

  // pick all matching rules, apply by priority ascending (so higher priority applies last)
  const matching = SECTION_RULES.filter((r) =>
    r.match.some((m) => haystack.includes(normalize(m)))
  ).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  for (const rule of matching) {
    rule.include?.forEach((k) => includes.add(k));
    rule.exclude?.forEach((k) => excludes.add(k));
    if (rule.titleOverrides) {
      for (const [k, v] of Object.entries(rule.titleOverrides)) {
        titleOverrides[k] = v;
      }
    }
  }

  return { includes, excludes, titleOverrides };
}

export function buildProductSections(product: Product): ProductSection[] {
  const { includes, excludes, titleOverrides } = mergeRules(product);

  const hasAllowlist = includes.size > 0;

  const sections = BASE_SECTIONS.filter((s) => {
    if (excludes.has(s.key)) return false;
    if (hasAllowlist && !includes.has(s.key)) return false;

    const value = s.getValue(product);
    return value != null && String(value).trim().length > 0;
  })
    .map((s) => ({
      ...s,
      title: titleOverrides[s.key] ?? s.title,
    }))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return sections;
}
