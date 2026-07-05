export function getOrderStatusClasses(status: string) {
  const normalized = (status ?? "").toLowerCase();

  if (normalized === "completed" || normalized === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "on-hold" || normalized === "pending_payment") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized === "processing" || normalized === "awaiting_dispatch") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "failed" ||
    normalized === "refunded"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-border bg-muted text-muted-foreground";
}

export function orderStatusLabel(status: string) {
  return (status ?? "unknown").replace(/_/g, " ");
}
