/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductJsonLd } from "@/shared/seo/product-json-ld";
import { BreadcrumbJsonLd } from "@/shared/seo/breadcrumb-json-ld";
import { ProductPageClient } from "@/features/Products/ui/product-page-client";
import {
  getProductBySlugWithVariations as _getProductBySlugWithVariations,
  listProducts,
} from "@/features/Products/actions/products";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { getProductReviews } from "@/features/reviews/actions/get-product-reviews";
import { productToSeo } from "@/shared/seo/product-to-seo";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getStorefrontConfig as _getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { HydrationLoading } from "@/shared/ui/hydration-loading";

// ✅ Memoize to avoid double DB hit from generateMetadata + page render
const getProductBySlugWithVariations = cache(async (slug: string) => {
  return _getProductBySlugWithVariations(slug);
});

// ✅ Also memoize config to avoid double hit
const getStorefrontConfig = cache(async () => {
  return _getStorefrontConfig();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [config, product] = await Promise.all([
    getStorefrontConfig(),
    getProductBySlugWithVariations(slug),
  ]);

  if (!product || Array.isArray(product)) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const pageSeo = productToSeo(product);

  const base = buildMetadata({
    globalSeo: config.seo,
    pageSeo,
  });

  const baseUrl = getBaseUrl();
  const canonical = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : `/products/${product.slug}`;

  return {
    ...base,
    alternates: { canonical },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [config, product] = await Promise.all([
    getStorefrontConfig(),
    getProductBySlugWithVariations(slug),
  ]);

  if (!product || Array.isArray(product)) return notFound();

  // ✅ pick a “primary” category safely
  const primaryCategory =
    (product.categories ?? []).find((c: any) => c?.slug) ??
    product.categories?.[0];

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    primaryCategory
      ? listProducts({
          categoryId: String(primaryCategory.id),
          limit: 8,
          offset: 0,
        })
      : Promise.resolve([]),
  ]);

  const baseUrl = getBaseUrl();
  const productUrl = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : `/products/${product.slug}`;

  // ✅ IMPORTANT: use /collections not /category (based on your routing)
  const breadcrumbItems = [
    { name: "Home", url: baseUrl || "/" },
    ...(product.categories ?? []).map((cat: any) => ({
      name: cat.name,
      url: baseUrl
        ? `${baseUrl}/collections/${cat.slug}`
        : `/collections/${cat.slug}`,
    })),
    { name: product.name, url: productUrl },
  ];

  const logoUrl = config.theme?.assets?.logoUrl ?? "";
  const storeName = config.store?.name ?? "Store";

  return (
    <>
      {logoUrl ? (
        <HydrationLoading logoUrl={logoUrl} storeName={storeName} />
      ) : null}

      <ProductJsonLd
        product={product}
        reviews={reviews}
        brandName={storeName}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <ProductPageClient
        product={product}
        relatedProducts={relatedProducts}
        user={null}
        reviews={reviews}
        config={config}
      />
    </>
  );
}
