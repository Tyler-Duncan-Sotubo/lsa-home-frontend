import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { AboutSections } from "@/features/Pages/About/about-sections";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.about?.seo,
  });
}

export default async function AboutPage() {
  const config = await getStorefrontConfig();

  return (
    <div>
      <AboutSections sections={config.pages?.about?.sections} />
    </div>
  );
}
