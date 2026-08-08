import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getTheme } from "@/themes/registry";

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
  const { Hero, HomeSections, HomeContactSection } = getTheme(config);

  // Reuse the /contact page's contact-details section (address/phone/
  // email/social) instead of a separate pages.home.contact value, so
  // there's one source for that data instead of two independently-edited
  // copies. Layout (map embed, positioning) still comes from
  // pages.home.contact since the /contact page's own layout includes a
  // form the homepage block doesn't render.
  const contactDetails = config.pages?.contact?.sections?.find(
    (s) => s.type === "contact",
  );
  const homeContact = config.pages?.home?.contact;
  const contactSection =
    contactDetails && homeContact
      ? { ...homeContact, info: contactDetails.info }
      : homeContact;

  return (
    <div>
      {/* Config-driven hero */}
      <Hero hero={config.pages?.home?.hero} />
      <HomeSections sections={config.pages?.home?.sections} />
      <HomeContactSection section={contactSection} />
    </div>
  );
}
