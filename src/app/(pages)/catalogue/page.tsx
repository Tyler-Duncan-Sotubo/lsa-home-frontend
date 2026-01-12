import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { CatalogueSections } from "@/features/Catalogue/catalogue-sections";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.catalogue?.seo,
  });
}

export default async function Page() {
  const config = await getStorefrontConfig();
  return (
    <main>
      <CatalogueSections sections={config.pages?.catalogue?.sections} />
    </main>
  );
}
