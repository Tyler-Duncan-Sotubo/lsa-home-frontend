import type { Metadata } from "next";
import { CheckoutClient } from "@/features/checkout/ui/checkout-client";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo, // ← favicon / icons live here
    pageSeo: {
      title: "Checkout",
      description: "Complete your purchase securely.",
    },
  });
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ checkoutId: string }>;
}) {
  const { checkoutId } = await params;
  return <CheckoutClient checkoutId={checkoutId} />;
}
