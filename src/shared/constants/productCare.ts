// src/config/productCare.ts

// Care text by WooCommerce *category slug*
export const CARE_BY_CATEGORY: Record<string, string> = {
  bedding: `
Machine wash cold on gentle cycle.
Tumble dry low or line dry.
Do not bleach. Warm iron if needed.
`.trim(),

  towels: `
Wash before first use.
Machine wash warm with similar colors.
Tumble dry low. Avoid fabric softeners to maintain absorbency.
`.trim(),

  loungewear: `
Machine wash cold with similar colors.
Do not bleach.
Tumble dry low or lay flat to dry.
`.trim(),

  // add more slugs as you need…
};

export const DEFAULT_CARE_INSTRUCTIONS = `
Machine wash according to care label.
Wash with similar colors.
Do not bleach. Tumble dry low or line dry.
`.trim();
