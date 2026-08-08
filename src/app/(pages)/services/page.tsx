import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { ServicesSections } from "@/features/Services/blocks/services-sections";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.services?.seo,
  });
}

export default async function ServicesPage() {
  const config = await getStorefrontConfig();

  return (
    <div>
      <ServicesSections sections={config.pages?.services?.sections} />
    </div>
  );
}
