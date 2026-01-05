/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import type { SeoConfigV1 } from "@/config/types/seo.types";

export function buildMetadata({
  globalSeo,
  pageSeo,
}: {
  globalSeo?: SeoConfigV1;
  pageSeo?: SeoConfigV1;
}): Metadata {
  const seo = { ...globalSeo, ...(pageSeo ?? {}) };

  const siteName = seo.siteName ?? globalSeo?.siteName;

  const title =
    seo.title && siteName
      ? seo.title.includes(siteName)
        ? seo.title
        : `${seo.title} | ${siteName}`
      : seo.title ?? siteName;

  const base = seo.canonicalBaseUrl ?? globalSeo?.canonicalBaseUrl;

  // ✅ Build icons without nulls
  const icon: NonNullable<Metadata["icons"]> extends infer T
    ? T extends { icon?: infer I }
      ? I extends any[]
        ? I
        : never
      : never
    : never = [];

  if (seo.favicon?.svg)
    icon.push({ url: seo.favicon.svg, type: "image/svg+xml" });
  if (seo.favicon?.png) icon.push({ url: seo.favicon.png, type: "image/png" });
  if (seo.favicon?.ico) icon.push({ url: seo.favicon.ico });

  const icons: Metadata["icons"] = seo.favicon
    ? {
        icon: icon.length ? icon : undefined,
        apple: seo.favicon.appleTouch
          ? [{ url: seo.favicon.appleTouch }]
          : undefined,
      }
    : undefined;

  return {
    metadataBase: base ? new URL(base) : undefined,
    title,
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    icons,
    openGraph: seo.ogImage
      ? {
          title,
          description: seo.description ?? globalSeo?.description,
          siteName,
          images: [
            {
              url: seo.ogImage.url,
              alt: seo.ogImage.alt,
              width: seo.ogImage.width,
              height: seo.ogImage.height,
            },
          ],
        }
      : undefined,
  };
}
