/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import type { SeoConfigV1 } from "@/config/types/seo.types";

// ✅ Resolve relative URLs against the canonical base
function resolveUrl(
  url: string | undefined | null,
  base: string | undefined | null,
): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (base)
    return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
  return url; // leave as-is if no base (will likely not work for crawlers but better than crashing)
}

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
      : (seo.title ?? siteName);

  const base = seo.canonicalBaseUrl ?? globalSeo?.canonicalBaseUrl;

  // ✅ Favicon always from globalSeo — page SEO never has a favicon
  const faviconSource = globalSeo?.favicon ?? seo.favicon;

  const icon: any[] = [];

  if (faviconSource?.svg)
    icon.push({
      url: resolveUrl(faviconSource.svg, base)!,
      type: "image/svg+xml",
    });
  if (faviconSource?.png)
    icon.push({
      url: resolveUrl(faviconSource.png, base)!,
      type: "image/png",
    });
  if (faviconSource?.ico)
    icon.push({
      url: resolveUrl(faviconSource.ico, base)!,
    });

  const icons: Metadata["icons"] = faviconSource
    ? {
        icon: icon.length ? icon : undefined,
        apple: faviconSource.appleTouch
          ? [{ url: resolveUrl(faviconSource.appleTouch, base)! }]
          : undefined,
      }
    : undefined;

  // ✅ OG image: page-level first, fallback to global
  const ogImageRaw = seo.ogImage ?? globalSeo?.ogImage ?? null;
  const ogImageUrl = ogImageRaw ? resolveUrl(ogImageRaw.url, base) : null;

  return {
    metadataBase: base ? new URL(base) : undefined,
    title,
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    icons,

    openGraph: {
      title,
      description: seo.description ?? globalSeo?.description,
      siteName,
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                alt: ogImageRaw?.alt ?? title,
                width: ogImageRaw?.width ?? 1200,
                height: ogImageRaw?.height ?? 630,
              },
            ],
          }
        : {}),
    },

    // ✅ Twitter/X — WhatsApp on iOS reads this too
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title,
      description: seo.description ?? globalSeo?.description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
