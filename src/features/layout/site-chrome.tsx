"use client";

import { usePathname } from "next/navigation";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { HeaderComposition } from "@/features/layout/Header/composition/header-composition";
import { SiteFooter } from "@/features/layout/Footer/site-footer";
import { CheckoutHeader } from "@/features/checkout/ui/checkout-header";
import { CheckoutFooter } from "@/features/checkout/ui/checkout-footer";

// ✅ Checkout intentionally drops the full nav/mega-menu/footer — every link
// out of checkout is a chance to abandon the order, so it gets a minimal
// logo + secure badge instead, same as any serious checkout (Shopify's
// included) does.
function isCheckoutPath(pathname: string | null) {
  return !!pathname && pathname.startsWith("/checkout");
}

export function SiteHeaderSwitch({ config }: { config: StorefrontConfigV1 }) {
  const pathname = usePathname();
  return isCheckoutPath(pathname) ? (
    <CheckoutHeader config={config} />
  ) : (
    <HeaderComposition config={config} />
  );
}

export function SiteFooterSwitch({ config }: { config: StorefrontConfigV1 }) {
  const pathname = usePathname();
  return isCheckoutPath(pathname) ? (
    <CheckoutFooter config={config} />
  ) : (
    <SiteFooter config={config} />
  );
}
