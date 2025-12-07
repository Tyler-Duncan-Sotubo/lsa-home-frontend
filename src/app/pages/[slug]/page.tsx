// app/pages/[slug]/page.tsx
import { Suspense } from "react";
import { getParentCategoryCollections } from "@/lib/woocommerce/collections";
import { ProductRail } from "@/components/products/product-rail";
import { ProductRailSkeleton } from "@/components/skeleton/product-rail-skeleton";

export default async function AllCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { parent, children } = await getParentCategoryCollections(slug, {
    perChild: 8,
    status: "publish",
  });

  if (!parent) {
    return (
      <div className="w-[95%] mx-auto py-10">
        <h1 className="text-2xl font-semibold">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto py-10 space-y-10">
      {/* Page heading */}
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold">
          {parent.name.replace(/^All\s+/i, "")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore our full {parent.name.replace(/^All\s+/i, "").toLowerCase()}{" "}
          collection.
        </p>
      </header>

      {/* One section per child category */}
      {children.map(({ category, products }) =>
        products.length === 0 ? null : (
          <Suspense
            // Suspense isn’t strictly needed here since we already awaited,
            // but you can keep skeletons if you refactor to stream later.
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
