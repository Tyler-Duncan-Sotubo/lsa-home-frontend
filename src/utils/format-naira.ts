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
