import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { TestimonialsSections } from "@/features/Testimonials/blocks/testimonials-sections";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.testimonials?.seo,
  });
}

export default async function TestimonialsPage() {
  const config = await getStorefrontConfig();

  return (
    <div>
      <TestimonialsSections sections={config.pages?.testimonials?.sections} />
    </div>
  );
}
