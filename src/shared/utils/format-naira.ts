const normalizeNumber = (value: string) => value.replace(/[₦,\s]/g, "").trim();

export const formatNaira = (value?: string | number | null) => {
  if (value == null || value === "") return null;

  const num =
    typeof value === "number" ? value : Number(normalizeNumber(value));

  if (!Number.isFinite(num)) return null;

  return num.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
};

/**
 * Formats:
 *  - "8500"                    → ₦8,500.00
 *  - "₦8,500.00"               → ₦8,500.00
 *  - "8500 - 35000"            → ₦8,500.00 – ₦35,000.00
 *  - "₦8,500 – ₦35,000"        → ₦8,500.00 – ₦35,000.00
 *  - null / ""                 → null
 */
export function formatPriceDisplay(value?: string | null): string | null {
  if (!value) return null;

  // Normalize dash variants
  const normalized = value.replace(/–/g, "-");

  if (normalized.includes("-")) {
    const [min, max] = normalized.split("-").map((v) => v.trim());
    const minFmt = formatNaira(min);
    const maxFmt = formatNaira(max);

    if (minFmt && maxFmt) {
      return `${minFmt} – ${maxFmt}`;
    }
  }

  return formatNaira(normalized);
}
