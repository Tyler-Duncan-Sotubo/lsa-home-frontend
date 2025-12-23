"use client";

import { useGetProducts } from "@/features/products/hooks/use-products";
import { ProductRail } from "@/features/products/ui/product-rail";

export default function ProductsSection() {
  const {
    data: products,
    isLoading,
    error,
  } = useGetProducts({
    limit: 12,
    offset: 0,
  });

  if (isLoading) return null;
  if (error) return null;

  return (
    <ProductRail
      title="Products"
      subtitle="Browse our collection"
      products={products ?? []}
      sectionClassName="w-[95%] mx-auto py-8"
    />
  );
}
