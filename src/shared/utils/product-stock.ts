/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Variant-aware in-stock check. A variable product counts as in stock if
 * any variation is buyable; a simple product falls back to its own
 * stock_quantity/stock_status. Defaults to true when neither is present
 * (matches existing behavior in product-details.tsx, which this was
 * extracted from).
 */
export function isProductInStock(product: any): boolean {
  const p = product;

  if (Array.isArray(p?.variations) && p.variations.length > 0) {
    return p.variations.some((v: any) => {
      if (v?.manage_stock) return Number(v?.stock_quantity ?? 0) > 0;
      if (v?.stock_status) return v.stock_status === "instock";
      return true;
    });
  }

  if (p?.manage_stock) return Number(p?.stock_quantity ?? 0) > 0;
  if (p?.stock_status) return p.stock_status === "instock";

  return true;
}
