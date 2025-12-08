// app/products/[slug]/page.tsx
import type { Metadata } from "next";
import { ProductPageClient } from "./ProductPageClient";
import {
  getProductBySlugWithVariations,
  getRelatedProductsByCategory,
  getProductReviews,
} from "@/lib/woocommerce/products";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

type PageParams = { slug: string };

type PageProps = {
  params: Promise<PageParams>;
};

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("NEXT_PUBLIC_SITE_URL not set");
    }
    return "";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

/* -------------------- METADATA -------------------- */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlugWithVariations(slug);

  if (!product) {
    return {
      title: "Product not found | Your Brand",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = getBaseUrl();
  const url = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : `/products/${product.slug}`;

  // Raw description, fallback to empty string
  const rawDescription = product.short_description || product.description || "";

  // Extract meta title and description from meta_data
  const metaTitle =
    product.meta_data?.find((m) => m.key === "meta_title")?.value || null;

  const metaDescription =
    product.meta_data?.find((m) => m.key === "meta_description")?.value || null;

  // SEO title (meta > fallback)
  const title =
    (typeof metaTitle === "string" && `${metaTitle.trim()} | LSA Home`) ||
    `${product.name} | LSA Home`;

  // SEO description (meta > cleaned description > generic fallback)
  const description =
    (typeof metaDescription === "string" && metaDescription.trim()) ||
    rawDescription
      .replace(/<[^>]*>/g, "") // strip HTML
      .trim()
      .slice(0, 155) ||
    `Shop ${product.name} at LSA Home.`;

  const images =
    product.images?.map((img: { src: string }) => img.src).filter(Boolean) ??
    [];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: images.length ? images.map((src) => ({ url: src })) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images[0] ? [images[0]] : undefined,
    },
  };
}
/* -------------------- PAGE -------------------- */

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getProductBySlugWithVariations(slug);
  if (!product) {
    // TODO: return notFound() or custom 404
    return null;
  }

  const [relatedProducts, reviews] = await Promise.all([
    getRelatedProductsByCategory(product, 8),
    getProductReviews(product.id),
  ]);

  const baseUrl = getBaseUrl();
  const productUrl = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : `/products/${product.slug}`;

  const breadcrumbItems = [
    {
      name: "Home",
      url: baseUrl || "/",
    },
    ...product.categories.map((cat) => ({
      name: cat.name,
      // adjust if your category route differs:
      url: baseUrl
        ? `${baseUrl}/category/${cat.slug}`
        : `/category/${cat.slug}`,
    })),
    {
      name: product.name,
      url: productUrl,
    },
  ];

  return (
    <>
      <ProductJsonLd product={product} reviews={reviews} brandName="LSA Home" />

      <BreadcrumbJsonLd items={breadcrumbItems} />

      <ProductPageClient
        product={product}
        relatedProducts={relatedProducts}
        user={null}
        reviews={reviews}
      />
    </>
  );
}
