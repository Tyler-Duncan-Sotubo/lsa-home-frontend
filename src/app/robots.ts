import type { MetadataRoute } from "next";
import { getSitemapBaseUrl } from "@/shared/seo/get-sitemap-base-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getSitemapBaseUrl();

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
