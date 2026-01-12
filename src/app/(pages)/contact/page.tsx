import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { ContactSections } from "@/features/Contact/contact-section";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.contact?.seo,
  });
}

export default async function ContactPage() {
  const config = await getStorefrontConfig();

  return (
    <div>
      <ContactSections sections={config.pages?.contact?.sections} />
    </div>
  );
}
