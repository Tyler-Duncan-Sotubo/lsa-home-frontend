import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { ThankYouSubscribingClient } from "@/features/marketing-opt-in/ui/thank-you-subscribing-client";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: {
      title: "Subscribed",
      description: "You're subscribed to our emails.",
    },
  });
}

export default async function ThankYouSubscribingPage() {
  const config = await getStorefrontConfig();
  return <ThankYouSubscribingClient storeName={config.store.name} />;
}
