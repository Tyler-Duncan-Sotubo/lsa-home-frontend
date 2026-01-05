import { Suspense } from "react";
import { ProductRailSkeleton } from "@/features/Pages/Products/ui/product-rail-skeleton";
import { ProductRail } from "@/features/Pages/Products/ui/product-rail";
import { getCollectionProductsGroupedBySlug } from "@/features/Pages/Collections/actions/get-collections";

export default async function AllCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ✅ NEW: backend grouped endpoint by slug
  const groups = await getCollectionProductsGroupedBySlug(slug, {
    perPage: 8, // per child category (your backend uses limit per category)
    page: 1,
    includeChildren: true,
  });

  // If the slug is invalid / no children
  if (!groups || groups.length === 0) {
    return (
      <div className="w-[95%] mx-auto py-10">
        <h1 className="text-2xl font-semibold">Collection not found</h1>
      </div>
    );
  }

  // We no longer have `parent` from Woo helper, so derive a sensible heading from the slug
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="w-[95%] mx-auto py-10 space-y-10">
      {/* Page heading */}
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold capitalize">
          {title.replace(/^All\s+/i, "")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore our full {title.replace(/^All\s+/i, "").toLowerCase()}{" "}
          collection.
        </p>
      </header>

      {/* One section per child category (each group) */}
      {groups.map(({ category, products }) =>
        !products || products.length === 0 ? null : (
          <Suspense
            key={category.id}
            fallback={<ProductRailSkeleton sectionClassName="w-full py-8" />}
          >
            <ProductRail
              title={category.name}
              subtitle={undefined}
              products={products}
              sectionClassName="w-full py-8"
            />
          </Suspense>
        )
      )}
    </div>
  );
}
