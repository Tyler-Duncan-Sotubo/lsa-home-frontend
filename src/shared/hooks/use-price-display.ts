// src/shared/hooks/usePriceDisplay.ts
"use client";

import { formatPriceDisplayWith } from "../utils/format-naira";
import { useMoney } from "./use-money";

export function usePriceDisplay() {
  const formatMoney = useMoney();

  return (value?: string | null) =>
    formatPriceDisplayWith(value ?? null, formatMoney);
}
