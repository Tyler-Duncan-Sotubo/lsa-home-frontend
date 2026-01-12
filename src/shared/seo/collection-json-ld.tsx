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
}

export function CollectionJsonLd({
  collection,
  products,
  basePath = "/collections",
}: CollectionJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl && process.env.NODE_ENV !== "production") {
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not set – CollectionJsonLd will render without absolute urls."
    );
  }

  const normalizedBase = siteUrl?.endsWith("/")
    ? siteUrl.slice(0, -1)
    : siteUrl;

  const collectionUrl = normalizedBase
    ? `${normalizedBase}${basePath}/${collection.slug}`
    : undefined;

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  const description = collection.description
    ? stripHtml(collection.description)
    : undefined;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    url: collectionUrl,
    description,
    primaryImageOfPage: collection.imageUrl
      ? {
          "@type": "ImageObject",
          url: collection.imageUrl,
        }
      : undefined,

    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: products?.length ?? 0,
      itemListElement: (products ?? []).map((p, index) => {
        const productUrl = normalizedBase
          ? `${normalizedBase}/products/${p.slug}`
          : undefined;

        const image = p.images?.[0]?.src;

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

  // Clean up undefined fields (optional but keeps output tidy)
  const clean = (obj: any) =>
    JSON.parse(
      JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v))
    );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean(jsonLd)) }}
    />
  );
}
