"use client";

import { usePathname } from "next/navigation";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { HeaderComposition } from "./Header/composition/header-composition";
import { SiteFooter } from "./Footer/site-footer";
import { CheckoutHeader } from "@/features/checkout/ui/checkout-header";
import { CheckoutFooter } from "@/features/checkout/ui/checkout-footer";

// ✅ Checkout intentionally drops the full nav/mega-menu/footer — every link
// out of checkout is a chance to abandon the order, so it gets a minimal
// logo + secure badge instead, same as any serious checkout (Shopify's
// included) does. Payment links are the same shape of flow (customer lands
// directly on a page to pay a fixed amount, not to browse) so they get the
// same minimal chrome.
function isCheckoutPath(pathname: string | null) {
  return (
    !!pathname &&
    (pathname.startsWith("/checkout") || pathname.startsWith("/pay"))
  );
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
