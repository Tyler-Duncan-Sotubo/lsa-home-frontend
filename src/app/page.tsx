import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { Hero } from "@/features/Home/blocks/hero/hero";
import { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { HomeSections } from "@/features/Home/blocks/home-sections";
import { ContactSectionCompact } from "@/features/Contact/blocks/contact-form/contact-compact/contact-compact";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  // ✅ System page metadata
  if (config.ui?.systemPage?.kind === "store-not-found") {
    return buildMetadata({
      globalSeo: {
        title: config.ui.systemPage.title ?? "Store not found",
        description:
          config.ui.systemPage.description ??
          "We couldn’t find a storefront for this domain.",
      },
    });
  }

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
