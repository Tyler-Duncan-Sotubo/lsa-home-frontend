/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Product,
  ProductReview,
} from "@/features/Products/types/products";

interface ProductJsonLdProps {
  product: Product;
  reviews?: ProductReview[];
  brandName?: string;
}

export function ProductJsonLd({
  product,
  reviews,
  brandName = "Your Brand",
}: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl && process.env.NODE_ENV !== "production") {
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not set – ProductJsonLd will render without url."
    );
  }

  const normalizedBase = baseUrl?.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const url = normalizedBase
    ? `${normalizedBase}/products/${product.slug}`
    : undefined;

  const images = product.images?.map((img) => img?.src).filter(Boolean) ?? [];

  const rawDescription = product.short_description || product.description || "";
  const description = rawDescription.replace(/<[^>]*>/g, "").trim();

  // SKU from meta_data (_sku)
  const skuMeta = product.meta_data?.find((m) => m.key === "_sku");
  const sku =
    typeof skuMeta?.value === "string" && skuMeta.value.trim()
      ? skuMeta.value
      : undefined;

  const availability =
    product.stock_status === "instock"
      ? "https://schema.org/InStock"
      : product.stock_status === "onbackorder"
      ? "https://schema.org/PreOrder"
      : "https://schema.org/OutOfStock";

  const price = product.price || product.regular_price || undefined;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description,
    sku,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    category: product.categories?.map((c) => c.name).join(" / ") || undefined,
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

  if (product.rating_count && Number(product.rating_count) > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.average_rating,
      reviewCount: product.rating_count,
    };
  }

  if (reviews && reviews.length > 0) {
    const approvedReviews = reviews.filter(
      (r) => r.status === "approved" || !r.status
    );

    if (approvedReviews.length > 0) {
      jsonLd.review = approvedReviews.map((r) => ({
        "@type": "Review",
        reviewBody: r.review,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
