/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductJsonLd } from "@/shared/seo/product-json-ld";
import { BreadcrumbJsonLd } from "@/shared/seo/breadcrumb-json-ld";
import { ProductPageClient } from "@/features/products/ui/product-page-client";
import {
  getProductBySlugWithVariations as _getProductBySlugWithVariations,
  listProducts,
} from "@/features/products/actions/products";

import { buildProductMetadata } from "@/shared/seo/product-metadata";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { getProductReviews } from "@/features/reviews/actions/get-product-reviews";

// ✅ Memoize to avoid double DB hit from generateMetadata + page render
const getProductBySlugWithVariations = cache(async (slug: string) => {
  return _getProductBySlugWithVariations(slug);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlugWithVariations(slug);

  if (!product) {
    return {
      title: "Product not found | LSA Home",
      robots: { index: false, follow: false },
    };
  }

  return buildProductMetadata({
    product,
    baseUrl: getBaseUrl(),
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlugWithVariations(slug);
  if (!product) return notFound();

  const firstCategory = product.categories?.[1];

  // ✅ Parallelize independent calls
  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    firstCategory
      ? listProducts({
          categoryId: String(firstCategory.id),
          limit: 8,
          offset: 0,
        })
      : Promise.resolve([]),
  ]);

  const baseUrl = getBaseUrl();
  const productUrl = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : `/products/${product.slug}`;

  const breadcrumbItems = [
    { name: "Home", url: baseUrl || "/" },
    ...(product.categories ?? []).map((cat: any) => ({
      name: cat.name,
      url: baseUrl
        ? `${baseUrl}/category/${cat.slug}`
        : `/category/${cat.slug}`,
    })),
    { name: product.name, url: productUrl },
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
