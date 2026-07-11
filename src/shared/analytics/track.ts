/* eslint-disable @typescript-eslint/no-explicit-any */
// Safe wrapper around the internal analytics tag (loaded by
// AnalyticsTagLoader). No-ops when the tag isn't present.
export function trackEvent(
  event: "add_to_cart" | "begin_checkout" | "purchase",
  extra?: Record<string, any>,
) {
  try {
    if (typeof window === "undefined") return;
    window.__sfAnalytics?.track?.(event, extra ?? {});
  } catch {
    // analytics must never break the shopping flow
  }
}
