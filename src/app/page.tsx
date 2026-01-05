import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { Hero } from "@/features/Pages/Home/Hero/hero";
import { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { HomeSections } from "@/features/Pages/Home/Sections/home-sections";
import { ContactSectionCompact } from "@/features/Pages/Contact/contact-section-compact";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.home?.seo,
  });
}

export default async function Home() {
  const config = await getStorefrontConfig();
  return (
    <div>
      {/* Config-driven hero */}
      <Hero hero={config.pages?.home?.hero} />
      <HomeSections sections={config.pages?.home?.sections} />
      <ContactSectionCompact section={config.pages?.home?.contact} />
    </div>
  );
}
