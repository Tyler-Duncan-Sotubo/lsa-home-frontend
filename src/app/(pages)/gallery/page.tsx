import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import type { LocalGallerySectionV1 } from "@/config/types/pages/Home/home-sections.types";
import LocalGallery from "@/themes/andrea/home/blocks/local-gallery/local-gallery";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: { title: "Gallery" },
  });
}

export default async function GalleryPage() {
  const config = await getStorefrontConfig();

  const section = config.pages?.home?.sections?.find(
    (s): s is LocalGallerySectionV1 => s.type === "localGallery",
  );

  if (!section) return null;

  // Full gallery page: paginate through all seed items (maxItems becomes
  // the page size), no "view full gallery" CTA since we're already on it.
  const fullSection: LocalGallerySectionV1 = {
    ...section,
    ctaHref: undefined,
  };

  return (
    <div>
      <LocalGallery config={fullSection} paginated />
    </div>
  );
}
