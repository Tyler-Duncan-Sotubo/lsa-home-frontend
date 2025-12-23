export const formatNaira = (value?: string | number | null) => {
  if (!value) return null;

  // Convert WooCommerce string values ("35000") to a number
  const num = Number(value);

  // Prevent NaN errors
  if (Number.isNaN(num)) return null;

  return num.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
};

/**
 * Formats:
 *  - "8500"           → ₦8,500
 *  - "8500 - 35000"   → ₦8,500 – ₦35,000
 *  - null / ""        → null
 */
export function formatPriceDisplay(value?: string | null): string | null {
  if (!value) return null;

  // Range: "8500 - 35000"
  if (value.includes("-")) {
    const [min, max] = value.split("-").map((v) => v.trim());
    const minFmt = formatNaira(min);
    const maxFmt = formatNaira(max);

    if (minFmt && maxFmt) {
      return `${minFmt} – ${maxFmt}`;
    }
  }

  // Single numeric value
  const single = formatNaira(value);
  return single ?? null;
}
