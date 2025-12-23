/* eslint-disable @typescript-eslint/no-explicit-any */
import { listCollectionProducts } from "@/features/collections/actions/get-collections";
import { CollectionPageClient } from "@/features/collections/ui/collection-page-client";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const products = await listCollectionProducts(slug, {
    perPage: 24,
    includeChildren: true,
  });

  if (!products[0]?.categories) {
    return <div>Collection not found</div>;
  }

  return (
    <CollectionPageClient
      category={products[0]?.categories as any}
      products={products}
    />
  );
}
