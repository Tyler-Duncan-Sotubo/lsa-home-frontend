// src/features/faq/hooks/use-faq-page-controller.ts
"use client";

import { useMemo, useState } from "react";
import { faqs } from "@/shared/assets/data/faq";
import {
  groupFaqsByCategory,
  sortCategories,
  type Faq,
} from "@/features/faq/lib/faq-grouping";

export function useFaqPageController() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const grouped = useMemo(() => groupFaqsByCategory(faqs), []);
  const sortedCategories = useMemo(
    () => sortCategories(Object.keys(grouped)),
    [grouped]
  );

  const getItemsToShow = (
    category: string
  ): { showingAll: boolean; itemsToShow: Faq[] } => {
    const questions = grouped[category] ?? [];
    const showingAll = expandedCategory === category;
    return {
      showingAll,
      itemsToShow: showingAll ? questions : questions.slice(0, 4),
    };
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return {
    grouped,
    sortedCategories,
    expandedCategory,
    toggleCategory,
    getItemsToShow,
  };
}
