// app/products/[slug]/page.tsx

import { ProductPageClient } from "./ProductPageClient";
import { getProductBySlugWithVariations } from "@/lib/woocommerce/products";
import type { ProductGalleryProps } from "@/types/products";
import { auth } from "@/app/api/auth/[...nextauth]/route";

type PageParams = {
  slug: string;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugWithVariations(slug);
  const session = await auth(); // 👈 server-side session

  const user = session
    ? {
        name: session.user?.name || "",
        email: session.user?.email || "",
      }
    : null;

  if (!product) {
    // handle 404 or redirect
  }

  const galleryProduct = {
    ...product,
  };

  return (
    <ProductPageClient
      product={galleryProduct as unknown as ProductGalleryProps["product"]}
      user={user}
    />
  );
}
