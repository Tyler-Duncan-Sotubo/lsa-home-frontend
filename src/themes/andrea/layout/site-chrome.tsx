"use client";

import { usePathname } from "next/navigation";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { HeaderComposition } from "./header-composition";
import { Footer } from "./footer";
import { CheckoutHeader } from "@/features/checkout/ui/checkout-header";
import { CheckoutFooter } from "@/features/checkout/ui/checkout-footer";

// Same checkout-path carve-out as modave (see modave/layout/site-chrome.tsx
// for the reasoning).
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
    <Footer config={config} footer={config.footer} />
  );
}
