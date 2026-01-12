/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnalyticsProvider = "ga4" | "meta_pixel" | "gtm";

export type StorefrontAnalyticsIntegration = {
  id?: string;
  provider: AnalyticsProvider | string;
  enabled: boolean;
  requiresConsent: boolean;
  publicConfig: Record<string, any>;
};
