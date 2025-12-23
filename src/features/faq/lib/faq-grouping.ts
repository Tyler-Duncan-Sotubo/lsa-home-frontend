/* eslint-disable @typescript-eslint/no-explicit-any */
import { faqs } from "@/shared/assets/data/faq";

export type Faq = (typeof faqs)[number];

const PRODUCT_SOURCE_CATEGORIES = [
  "Pillows",
  "Duvets",
  "Bath",
  "Mattress",
  "Sheets",
  "Fragrances",
  "Products",
  "Miscellaneous",
] as const;

export function getGroupCategory(faq: Faq): string {
  if (PRODUCT_SOURCE_CATEGORIES.includes(faq.category as any))
    return "Products";

  if (faq.category === "Privacy") return "Privacy";
  if (faq.category === "Your Account") return "Your Account";
  if (faq.category === "Returns") return "Returns";
  if (faq.category === "Orders") return "Orders";
  if (faq.category === "Delivery & Payments") return "Delivery & Payments";

  return faq.category;
}

export function groupFaqsByCategory(input: Faq[]) {
  return input.reduce((acc, faq) => {
    const key = getGroupCategory(faq);
    (acc[key] ||= []).push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);
}

export function sortCategories(categories: string[]) {
  const categoryOrder = [
    "Orders",
    "Delivery & Payments",
    "Returns",
    "Products",
    "Privacy",
    "Your Account",
  ];

  return [...categories].sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);

    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;

    return ia - ib;
  });
}
