"use client";
import { useAppSelector } from "@/store/hooks";

export function useMoney() {
  const currency = useAppSelector((s) => s.runtimeConfig.currency);

  return (value: number) =>
    value.toLocaleString(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.fractionDigits ?? 2,
      maximumFractionDigits: currency.fractionDigits ?? 2,
    });
}
