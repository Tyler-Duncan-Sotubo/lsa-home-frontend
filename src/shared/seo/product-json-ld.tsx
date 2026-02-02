/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Product,
  ProductReview,
} from "@/features/Products/types/products";

interface ProductJsonLdProps {
  product: Product;
  reviews?: ProductReview[];
  brandName?: string;

  /**
   * Pass the request base URL from the server (recommended).
   * e.g. const baseUrl = await getRequestBaseUrl();
   */
  baseUrl: string | null;
}

export function ProductJsonLd({
  product,
  reviews,
  brandName = "Your Brand",
  baseUrl,
}: ProductJsonLdProps) {
  if (!baseUrl && process.env.NODE_ENV !== "production") {
    console.warn(
      "ProductJsonLd: baseUrl is null – urls/images may be relative and rich results may be degraded.",
    );
  }

  const normalizedBase = baseUrl?.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const url =
    normalizedBase && product.slug
      ? `${normalizedBase}/products/${product.slug}`
      : undefined;

  // Ensure image URLs are absolute when possible
  const images =
    product.images
      ?.map((img) => img?.src)
      .filter((src): src is string => Boolean(src))
      .map((src) => {
        if (src.startsWith("http://") || src.startsWith("https://")) return src;
        if (!normalizedBase) return src; // fallback (dev)
        return src.startsWith("/")
          ? `${normalizedBase}${src}`
          : `${normalizedBase}/${src}`;
      }) ?? [];

  const rawDescription = product.short_description || product.description || "";
  const description =
    rawDescription.replace(/<[^>]*>/g, "").trim() || undefined;

  // SKU from meta_data (_sku)
  const skuMeta = product.meta_data?.find((m) => m.key === "_sku");
  const sku =
    typeof skuMeta?.value === "string" && skuMeta.value.trim()
      ? skuMeta.value.trim()
      : undefined;

  const availability =
    product.stock_status === "instock"
      ? "https://schema.org/InStock"
      : product.stock_status === "onbackorder"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock";

  const priceRaw = product.price || product.regular_price || undefined;
  const price =
    typeof priceRaw === "string" && priceRaw.trim()
      ? priceRaw.trim()
      : typeof priceRaw === "number"
        ? String(priceRaw)
        : undefined;

  // Ratings normalized as numbers
  const ratingValue = Number(product.average_rating);
  const reviewCount = Number(product.rating_count);

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.length ? images : undefined,
    description,
    sku,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    category:
      product.categories
        ?.map((c) => c.name)
        .filter(Boolean)
        .join(" / ") || undefined,
    url,
    offers:
      price && url
        ? {
            "@type": "Offer",
            url,
            priceCurrency: "NGN", // 🇳🇬 always Naira
            price,
            availability,
            itemCondition: "https://schema.org/NewCondition",
          }
        : undefined,
  };

  // Aggregate rating (only if valid)
  if (reviewCount > 0 && Number.isFinite(ratingValue) && ratingValue > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    };
  }

  // Reviews (only approved / no-status)
  if (reviews?.length) {
    const approvedReviews = reviews.filter(
      (r) => r.status === "approved" || !r.status,
    );

    if (approvedReviews.length) {
      jsonLd.review = approvedReviews
        .filter(
          (r) => Boolean(r.review) && Boolean(r.reviewer) && Boolean(r.rating),
        )
        .map((r) => ({
          "@type": "Review",
          reviewBody: r.review,
          reviewRating: {
            "@type": "Rating",
            ratingValue: Number(r.rating),
            bestRating: 5,
            worstRating: 1,
          },
          author: {
            "@type": "Person",
            name: r.reviewer,
          },
          datePublished: r.date_created,
        }));
    }
  }

  // Remove undefined keys for cleaner output
  for (const key of Object.keys(jsonLd)) {
    if (jsonLd[key] === undefined) delete jsonLd[key];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
