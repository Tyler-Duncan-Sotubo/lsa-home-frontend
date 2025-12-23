import { listProducts } from "@/features/products/actions/products";
import { Product } from "@/features/products/types/products";
import { ProductRail } from "@/features/products/ui/product-rail";

export default async function LatestSlider() {
  const products = await listProducts({
    limit: 6,
    categoryId: "019b4844-4547-7b8f-b6eb-db92cfd4d10e",
  });

  return (
    <ProductRail
      title="The Latest"
      subtitle="Just arrived and ready to ship."
      products={products as Product[]}
      sectionClassName="w-[95%] mx-auto py-8"
    />
  );
}
