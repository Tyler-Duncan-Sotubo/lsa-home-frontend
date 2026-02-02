/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Product } from "@/features/Products/types/products";

type Collection = {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};

interface CollectionJsonLdProps {
  collection: Collection;
  products: Product[];
  basePath?: string; // default "/collections"

  /**
   * Pass the request base URL from the server (recommended).
   * e.g. const baseUrl = await getRequestBaseUrl();
   */
  baseUrl: string | null;
}

export function CollectionJsonLd({
  collection,
  products,
  basePath = "/collections",
  baseUrl,
}: CollectionJsonLdProps) {
  if (!baseUrl && process.env.NODE_ENV !== "production") {
    console.warn(
      "CollectionJsonLd: baseUrl is null – urls/images may be relative and rich results may be degraded.",
    );
  }

  const normalizedBase = baseUrl?.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  const description =
    collection.description && collection.description.trim()
      ? stripHtml(collection.description)
      : undefined;

  const collectionUrl =
    normalizedBase && collection.slug
      ? `${normalizedBase}${basePath}/${collection.slug}`
      : undefined;

  const toAbsoluteUrl = (src?: string | null) => {
    if (!src) return undefined;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (!normalizedBase) return src; // fallback (dev)
    return src.startsWith("/")
      ? `${normalizedBase}${src}`
      : `${normalizedBase}/${src}`;
  };

  const collectionImageUrl = toAbsoluteUrl(collection.imageUrl);

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    url: collectionUrl,
    description,

    primaryImageOfPage: collectionImageUrl
      ? {
          "@type": "ImageObject",
          url: collectionImageUrl,
        }
      : undefined,

    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: products?.length ?? 0,
      itemListElement: (products ?? []).map((p, index) => {
        const productUrl =
          normalizedBase && p.slug
            ? `${normalizedBase}/products/${p.slug}`
            : undefined;

        const imageSrc = p.images?.[0]?.src;
        const image = toAbsoluteUrl(imageSrc);

        return {
          "@type": "ListItem",
          position: index + 1,
          url: productUrl,
          item: {
            "@type": "Product",
            name: p.name,
            url: productUrl,
            image: image ? [image] : undefined,
          },
        };
      }),
    },
  };

  // Remove undefined keys for cleaner output (including nested objects)
  const clean = (obj: any) =>
    JSON.parse(
      JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v)),
    );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean(jsonLd)) }}
    />
  );
}
