// app/collections/[slug]/page.tsx
import { getCollectionByCategorySlug } from "@/lib/woocommerce/collections";
import { CollectionPageClient } from "./collection-page-client";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { category, products } = await getCollectionByCategorySlug(slug, {
    perPage: 24,
    includeChildren: true,
  });

  if (!category) {
    return (
      <div className="w-[95%] mx-auto py-8">
        <h1 className="text-2xl font-semibold">Collection not found</h1>
      </div>
    );
  }

  return <CollectionPageClient category={category} products={products} />;
}
