import "server-only";

import { storefrontFetchSafe } from "@/shared/api/fetch";
import { StorefrontAnalyticsIntegration } from "../types/analytics.types";

export async function getStorefrontAnalyticsIntegrations() {
  const res = await storefrontFetchSafe<StorefrontAnalyticsIntegration[]>(
    "/api/integrations/analytics/storefront",
    {
      revalidate: 300,
    }
  );

  if (!res.ok) return [];
  return Array.isArray(res.data) ? res.data : [];
}
